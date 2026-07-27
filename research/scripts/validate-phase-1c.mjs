import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  buildPhase1C,
  renderClaimDocument,
} from './generate-phase-1c-claims.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(root, '../../..');
const prettier = path.join(repoRoot, 'node_modules', '.bin', 'prettier');
const expectedCounts = {
  codex: 84,
  'claude-code': 132,
  'qwen-code': 209,
};
const expectedSupport = {
  codex: { Supported: 4, Unknown: 80 },
  'claude-code': { Partial: 2, Unknown: 130 },
  'qwen-code': { Unknown: 209 },
};
const phase1CReviewedAt = '2026-07-25T21:40:12Z';
const controlledContractEnums = {
  AD: new Set(['default-on', 'default-off']),
  SO: new Set([
    'turn',
    'session',
    'process',
    'project',
    'workspace',
    'user',
    'organization',
    'external-service',
  ]),
  PE: new Set(['memory', 'transcript', 'local', 'remote', 'cross-device']),
  RM: new Set(['interactive', 'non-interactive', 'tty', 'non-tty', 'remote']),
  CE: new Set(['serial', 'queued', 'parallel', 'mixed']),
  SB: new Set([
    'host',
    'sandbox',
    'workspace',
    'network',
    'external-service',
    'other',
  ]),
};

function section(content, start, end) {
  const startIndex = content.indexOf(start);
  const endIndex = content.indexOf(end, startIndex + start.length);
  if (startIndex < 0 || endIndex < 0) {
    throw new Error(`missing section boundary: ${start} -> ${end}`);
  }
  return content.slice(startIndex, endIndex);
}

function tableClaimIds(content) {
  return [...content.matchAll(/^\| `(CCQ-[^`]+)` \|/gm)].map(
    (match) => match[1],
  );
}

function counts(values) {
  const result = {};
  for (const value of values) result[value] = (result[value] ?? 0) + 1;
  return result;
}

function sameCounts(actual, expected) {
  return (
    JSON.stringify(Object.entries(actual).sort()) ===
    JSON.stringify(Object.entries(expected).sort())
  );
}

function sameValues(actual, expected) {
  return (
    JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort())
  );
}

function markdownRow(content, label) {
  for (const line of content.split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());
    const rowLabel = cells[0]?.replaceAll(/[*`]/g, '').trim();
    if (rowLabel === label) return cells;
  }
  return null;
}

function numericCell(cell) {
  const value = Number(cell?.replaceAll(/[*`,]/g, '').trim());
  return Number.isFinite(value) ? value : null;
}

function inlineCountMap(cell) {
  const result = {};
  for (const match of (cell ?? '').matchAll(/`([^`]+?)\s+(\d+)`/g)) {
    result[match[1]] = Number(match[2]);
  }
  return result;
}

function coverageStats(productClaims, registry) {
  const leaf = { required: 0, recorded: 0, NC: 0, U: 0, NA: 0 };
  for (const claim of productClaims) {
    for (const name of registry.get(claim.atomic).requiredLeaves) {
      leaf.required += 1;
      const value = claim.contract[name];
      if (['NC', 'U', 'NA'].includes(value)) leaf[value] += 1;
      else leaf.recorded += 1;
    }
  }
  return {
    claims: productClaims.length,
    atoms: new Set(productClaims.map((claim) => claim.atomic)).size,
    facts: new Set(productClaims.flatMap((claim) => claim.originFacts)).size,
    slices: new Set(productClaims.map((claim) => claim.slice.id)).size,
    support: counts(productClaims.map((claim) => claim.support)),
    epistemic: counts(productClaims.map((claim) => claim.epistemic)),
    runtime: counts(productClaims.map((claim) => claim.runtime)),
    confidence: counts(productClaims.map((claim) => claim.confidence)),
    lifecycle: counts(productClaims.map((claim) => claim.lifecycle)),
    leaf,
  };
}

function contractText(claim) {
  return Object.values(claim.contract).join(' ');
}

function recordedContractValues(value) {
  const match = value.match(/^R\[(.*)\]$/);
  return match
    ? match[1]
        .split(';')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function evidenceType(evidenceId) {
  return evidenceId.match(/-([A-Z]+)-\d+$/)?.[1] ?? 'UNKNOWN';
}

function expectedPrimaryRelation(claim, evidence) {
  if (
    claim.originFacts.includes('FACT-qwen-code-034') &&
    evidence === 'EVD-qwen-code-DOC-021'
  ) {
    return 'contradicts';
  }
  if (evidenceType(evidence) === 'BINARY') {
    return 'qualifies';
  }
  if (
    evidenceType(evidence) === 'DOC' &&
    ['codex', 'claude-code'].includes(claim.product)
  ) {
    return 'qualifies';
  }
  if (
    evidenceType(evidence) === 'CHANGELOG' &&
    claim.product === 'claude-code' &&
    !claim.originFacts.some((factId) =>
      ['FACT-claude-code-052', 'FACT-claude-code-054'].includes(factId),
    )
  ) {
    return 'qualifies';
  }
  return 'supports';
}

function relationRecords(content) {
  const records = [];
  for (const line of content.split('\n')) {
    if (!line.startsWith('| `EVD-')) continue;
    const columns = line
      .split('|')
      .slice(1, -1)
      .map((column) => column.trim());
    const evidence = columns[0]?.match(/^`(EVD-[^`]+)`$/)?.[1];
    const relation = columns[1]?.match(
      /^`(supports|qualifies|contradicts)`$/,
    )?.[1];
    if (!evidence || !relation) continue;
    for (const claimId of [...columns[2].matchAll(/`(CCQ-[^`]+)`/g)].map(
      (idMatch) => idMatch[1],
    )) {
      records.push({
        evidence,
        relation,
        claimId,
      });
    }
  }
  return records;
}

function evidenceLedgerRecords(product) {
  const content = fs.readFileSync(
    path.join(root, 'evidence', `${product}.md`),
    'utf8',
  );
  const records = new Map();
  const knownTypes = new Set([
    'META',
    'SOURCE',
    'RUNTIME',
    'HELP',
    'DOC',
    'CHANGELOG',
    'BINARY',
    'TEST',
  ]);
  const qwenVersionHeader = content.match(/> 冻结版本：`([^`]+)` · `([^`]+)`/);
  const qwenCapturedAt = content.match(/> Captured at：`([^`]+)`/)?.[1] ?? null;
  for (const line of content.split('\n')) {
    if (!line.startsWith(`| \`EVD-${product}-`)) continue;
    const columns = line
      .split('|')
      .slice(1, -1)
      .map((column) => column.trim());
    const id = columns[0]?.match(/^`(EVD-[^`]+)`$/)?.[1];
    if (!id) continue;

    let type;
    let version;
    let channel;
    let surfaceText;
    let capturedAt;
    let provableScope;
    if (product === 'codex') {
      type = columns[1]?.replaceAll('`', '');
      if (!knownTypes.has(type)) continue;
      const versionParts = columns[2]
        .split('/')
        .map((part) => part.replaceAll('`', '').trim());
      [version, channel] = versionParts;
      surfaceText = columns[3];
      capturedAt = columns[5]?.match(/`([^`]+)`/)?.[1] ?? null;
      provableScope = columns[8];
    } else if (product === 'claude-code') {
      const fields = [...(columns[1] ?? '').matchAll(/`([^`]+)`/g)].map(
        (match) => match[1],
      );
      [type, version, channel, surfaceText] = fields;
      if (!knownTypes.has(type) || fields.length < 4) continue;
      capturedAt =
        columns[3]?.match(/`(\d{4}-\d{2}-\d{2}T[^`]+)`/)?.[1] ?? null;
      provableScope = columns[4];
    } else {
      type = columns[1]?.replaceAll('`', '').trim();
      if (!knownTypes.has(type)) continue;
      version = qwenVersionHeader?.[1] ?? null;
      channel = qwenVersionHeader?.[2] ?? null;
      surfaceText = columns[2];
      capturedAt = qwenCapturedAt;
      provableScope = columns[6];
    }

    const surfaces = new Set(
      [
        ...(surfaceText ?? '').matchAll(
          /(?:^|[^a-z-])(cli|ide|desktop|web-cloud|sdk-daemon|ci|im-bot)(?=$|[^a-z-])/gi,
        ),
      ].map((match) => match[1].toLowerCase()),
    );
    records.set(id, {
      id,
      type,
      version,
      channel,
      surfaces,
      capturedAt,
      provableScope: provableScope?.replaceAll('`', '').trim() ?? '',
    });
  }
  return records;
}

function formattedClaimDocument(product, productClaims) {
  if (!fs.existsSync(prettier)) {
    throw new Error(`Prettier not found at ${prettier}`);
  }
  return execFileSync(
    prettier,
    ['--parser', 'markdown', '--ignore-path', '/dev/null'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      input: renderClaimDocument(product, productClaims),
    },
  );
}

const { claims, facts, registry } = buildPhase1C({ write: false });
const errors = [];
const evidenceLedgers = Object.fromEntries(
  Object.keys(claims).map((product) => [
    product,
    evidenceLedgerRecords(product),
  ]),
);

for (const [product, productClaims] of Object.entries(claims)) {
  const file = path.join(root, 'claims', `${product}-cli.md`);
  const content = fs.readFileSync(file, 'utf8');
  if (content !== formattedClaimDocument(product, productClaims)) {
    errors.push(`${product}: generated Claim document content drift`);
  }
  const core = section(content, '## 2. Claim Core', '## 3. Behavior Contract');
  const contracts = section(
    content,
    '## 3. Behavior Contract',
    '## 4. Evidence Relation',
  );
  const relations = content.slice(content.indexOf('## 4. Evidence Relation'));
  const parsedRelations = relationRecords(relations);
  const coreIds = tableClaimIds(core);
  const contractIds = tableClaimIds(contracts);
  const relationIds = new Set(parsedRelations.map((record) => record.claimId));
  const objectIds = productClaims.map((claim) => claim.id);
  const objectById = new Map(productClaims.map((claim) => [claim.id, claim]));

  if (coreIds.length !== expectedCounts[product]) {
    errors.push(`${product}: Claim Core row count ${coreIds.length}`);
  }
  if (contractIds.length !== expectedCounts[product]) {
    errors.push(`${product}: contract row count ${contractIds.length}`);
  }
  if (new Set(coreIds).size !== coreIds.length) {
    errors.push(`${product}: duplicate Claim Core IDs`);
  }
  if (new Set(contractIds).size !== contractIds.length) {
    errors.push(`${product}: duplicate contract IDs`);
  }
  if (
    JSON.stringify([...coreIds].sort()) !==
    JSON.stringify([...objectIds].sort())
  ) {
    errors.push(`${product}: generated Claim Core content drift`);
  }
  if (JSON.stringify(contractIds) !== JSON.stringify(objectIds)) {
    errors.push(`${product}: generated contract order/content drift`);
  }
  for (const id of objectIds) {
    if (!relationIds.has(id)) errors.push(`${product}: no relation for ${id}`);
  }
  for (const record of parsedRelations) {
    const claim = objectById.get(record.claimId);
    const evidenceRecord = evidenceLedgers[product].get(record.evidence);
    if (!claim) {
      errors.push(`${product}: relation references unknown ${record.claimId}`);
    } else if (!claim.evidence.includes(record.evidence)) {
      errors.push(
        `${record.claimId}: relation uses undeclared evidence ${record.evidence}`,
      );
    }
    if (!evidenceRecord) {
      errors.push(`${record.evidence}: relation lacks parsed Evidence Record`);
      continue;
    }
    if (
      evidenceRecord.type !== evidenceType(record.evidence) ||
      !evidenceRecord.version ||
      !evidenceRecord.channel ||
      evidenceRecord.surfaces.size === 0 ||
      !evidenceRecord.provableScope ||
      !evidenceRecord.capturedAt
    ) {
      errors.push(`${record.evidence}: incomplete Evidence Record metadata`);
    }
    if (!evidenceRecord.surfaces.has(claim?.slice.surface)) {
      errors.push(
        `${record.claimId}/${record.evidence}: cross-Surface Evidence relation`,
      );
    }
    if (
      record.relation === 'supports' &&
      (evidenceRecord.version !== claim?.slice.version ||
        evidenceRecord.channel !== claim?.slice.channel)
    ) {
      errors.push(
        `${record.claimId}/${record.evidence}: supports relation is not exact-version/channel`,
      );
    }
    if (
      claim &&
      evidenceRecord.capturedAt &&
      claim.checked < evidenceRecord.capturedAt
    ) {
      errors.push(
        `${record.claimId}/${record.evidence}: last_checked predates Evidence capture`,
      );
    }
  }
  if (/current-docs@|unversioned-docs@|action-v1-docs@/.test(content)) {
    errors.push(`${product}: non-exact version leaked into formal Claim doc`);
  }

  const support = counts(productClaims.map((claim) => claim.support));
  if (!sameCounts(support, expectedSupport[product])) {
    errors.push(
      `${product}: support distribution ${JSON.stringify(support)} != ${JSON.stringify(expectedSupport[product])}`,
    );
  }
  for (const claim of productClaims) {
    const contractValues = Object.values(claim.contract);
    const required = registry.get(claim.atomic).requiredLeaves;
    for (const leaf of Object.keys(claim.contract)) {
      if (!required.has(leaf) && claim.contract[leaf] !== 'NA') {
        errors.push(`${claim.id}: non-required leaf ${leaf} is not NA`);
      }
      if (
        required.has(leaf) &&
        claim.contract[leaf] === 'NA' &&
        !(
          claim.product === 'codex' &&
          claim.atomic === 'CAP-01.09-A01' &&
          claim.support === 'Supported' &&
          leaf === 'AD'
        )
      ) {
        errors.push(`${claim.id}: required leaf ${leaf} used unapproved NA`);
      }
    }
    if (
      contractValues.some((value) =>
        /^R\[.*(?:unknown|not described|not documented|not explicitly (?:surfaced|described|documented)|partly documented|unspecified|未知|未说明|未描述|不明确)/i.test(
          value,
        ),
      )
    ) {
      errors.push(`${claim.id}: unknown encoded as recorded contract value`);
    }
    for (const [leaf, allowedValues] of Object.entries(
      controlledContractEnums,
    )) {
      const value = claim.contract[leaf];
      if (!value.startsWith('R[')) continue;
      const recordedValues = recordedContractValues(value);
      if (
        recordedValues.length === 0 ||
        recordedValues.some((item) => !allowedValues.has(item))
      ) {
        errors.push(`${claim.id}: invalid ${leaf} enum ${value}`);
      }
    }
    if (claim.checked !== phase1CReviewedAt) {
      errors.push(`${claim.id}: stale or non-deterministic last_checked`);
    }
    let supportsCount = 0;
    for (const evidence of claim.evidence) {
      const actual = parsedRelations
        .filter(
          (record) =>
            record.claimId === claim.id && record.evidence === evidence,
        )
        .map((record) => record.relation);
      const expectedPrimary = expectedPrimaryRelation(claim, evidence);
      const allowed = new Set([expectedPrimary]);
      if (
        claim.originFacts.includes('FACT-qwen-code-022') &&
        claim.atomic === 'CAP-06.02-A01' &&
        evidence === 'EVD-qwen-code-DOC-010'
      ) {
        allowed.add('contradicts');
      }
      if (
        actual.filter((relation) => relation === expectedPrimary).length !== 1
      ) {
        errors.push(
          `${claim.id}/${evidence}: expected one primary ${expectedPrimary}`,
        );
      }
      if (
        new Set(actual).size !== actual.length ||
        actual.some((relation) => !allowed.has(relation)) ||
        actual.length !== allowed.size
      ) {
        errors.push(
          `${claim.id}/${evidence}: invalid relation set ${actual.join(',')}`,
        );
      }
      if (expectedPrimary === 'supports') supportsCount += 1;
    }
    if (claim.support !== 'Unknown' && supportsCount === 0) {
      errors.push(`${claim.id}: non-Unknown support without supports evidence`);
    }
    if (claim.support === 'Supported') {
      for (const leaf of required) {
        if (['NC', 'U'].includes(claim.contract[leaf])) {
          errors.push(
            `${claim.id}: Supported with unresolved required leaf ${leaf}`,
          );
        }
      }
    }
  }
  if (
    parsedRelations.some((record) => {
      const claim = objectById.get(record.claimId);
      return (
        record.relation === 'supports' &&
        (evidenceType(record.evidence) === 'BINARY' ||
          (evidenceType(record.evidence) === 'DOC' &&
            ['codex', 'claude-code'].includes(claim?.product)) ||
          (evidenceType(record.evidence) === 'CHANGELOG' &&
            claim?.product === 'claude-code' &&
            !claim.originFacts.some((factId) =>
              ['FACT-claude-code-052', 'FACT-claude-code-054'].includes(factId),
            )))
      );
    })
  ) {
    errors.push(`${product}: qualifier-only evidence was promoted to supports`);
  }
}

const codex = claims.codex;
const claude = claims['claude-code'];
const qwen = claims['qwen-code'];
const factMaps = Object.fromEntries(
  Object.entries(facts).map(([product, productFacts]) => [
    product,
    new Map(productFacts.map((fact) => [fact.id, fact])),
  ]),
);
const allowedIsolation = new Set([
  'host',
  'container',
  'vm',
  'remote',
  'other',
  'not-applicable',
  'unknown',
]);
for (const productClaims of Object.values(claims)) {
  for (const claim of productClaims) {
    if (
      ['os', 'arch', 'shell'].some((field) => claim.slice[field] === 'unknown')
    ) {
      errors.push(`${claim.id}: unknown platform field violates Claim schema`);
    }
    if (!allowedIsolation.has(claim.slice.isolation)) {
      errors.push(
        `${claim.id}: invalid isolation enum ${claim.slice.isolation}`,
      );
    }
    if (/documented CLI surface/.test(contractText(claim))) {
      errors.push(`${claim.id}: fabricated generic entrypoint`);
    }
  }
}

for (const claim of claude) {
  const sourceFact = factMaps['claude-code'].get(claim.originFacts[0]);
  if (
    sourceFact?.atomics.length > 1 &&
    sourceFact.id !== 'FACT-claude-code-001'
  ) {
    const required = registry.get(claim.atomic).requiredLeaves;
    if ([...required].some((leaf) => claim.contract[leaf] !== 'NC')) {
      errors.push(
        `${claim.id}: multi-Atomic Claude contract was not conservative`,
      );
    }
  }
}
for (const claim of qwen) {
  const sourceFact = factMaps['qwen-code'].get(claim.originFacts[0]);
  if (
    sourceFact?.atomics.length > 1 &&
    ![
      'FACT-qwen-code-012',
      'FACT-qwen-code-022',
      'FACT-qwen-code-034',
      'FACT-qwen-code-039',
    ].includes(sourceFact.id)
  ) {
    const required = registry.get(claim.atomic).requiredLeaves;
    if ([...required].some((leaf) => claim.contract[leaf] !== 'NC')) {
      errors.push(
        `${claim.id}: multi-Atomic Qwen contract was not conservative`,
      );
    }
  }
}
if (
  claude
    .filter((claim) => claim.support === 'Partial')
    .some(
      (claim) =>
        claim.runtime !== 'Reproduced' ||
        !claim.originFacts.includes('FACT-claude-code-001'),
    ) ||
  qwen.some((claim) => claim.support === 'Partial')
) {
  errors.push(
    'Partial support was assigned without reproduced outcome evidence',
  );
}

if (
  codex.some(
    (claim) =>
      claim.slice.version !== '0.145.0' ||
      claim.slice.channel !== 'latest' ||
      claim.slice.surface !== 'cli',
  )
) {
  errors.push('Codex exact slice drift');
}
if (codex.some((claim) => claim.slice.isolation !== 'unknown')) {
  errors.push('Codex unprobed isolation was not kept unknown');
}
if (
  claude.some(
    (claim) =>
      !['2.1.212', '2.1.220'].includes(claim.slice.version) ||
      claim.slice.surface !== 'cli',
  )
) {
  errors.push('Claude exact slice drift');
}
if (
  qwen.some(
    (claim) =>
      claim.slice.version !== '0.21.0' ||
      claim.slice.channel !== 'stable' ||
      claim.slice.surface !== 'cli',
  )
) {
  errors.push('Qwen exact slice drift');
}

const codexApply = codex.filter((claim) =>
  claim.originFacts.includes('FACT-codex-023'),
);
if (
  codexApply.length !== 1 ||
  codexApply.some(
    (claim) =>
      !sameValues(claim.evidence, ['EVD-codex-HELP-002']) ||
      claim.lifecycle !== 'not-checked' ||
      !claim.configuration.includes('entry=top-level apply') ||
      claim.contract.EP !== 'R[apply <TASK_ID>]' ||
      claim.contract.IN !== 'R[cloud task ID]' ||
      claim.contract.SX !== 'R[git apply mutation of local worktree]' ||
      [...registry.get(claim.atomic).requiredLeaves].some(
        (leaf) =>
          !['EP', 'IN', 'SX'].includes(leaf) && claim.contract[leaf] !== 'NC',
      ) ||
      /cloud apply|cloud diff|exec-server/i.test(
        `${claim.statement} ${contractText(claim)}`,
      ),
  )
) {
  errors.push('Codex top-level apply was not isolated from cloud subcommands');
}

const codexCloud = codex.filter((claim) =>
  claim.originFacts.includes('FACT-codex-050'),
);
if (
  codexCloud.length !== 2 ||
  codexCloud.some(
    (claim) =>
      !sameValues(claim.evidence, ['EVD-codex-HELP-004']) ||
      claim.lifecycle !== 'experimental' ||
      !claim.configuration.every((entry) => entry.startsWith('entry=cloud ')) ||
      /exec-server/i.test(`${claim.statement} ${contractText(claim)}`),
  )
) {
  errors.push('Codex cloud CLI was not isolated from exec-server');
}
const codexInteractive = codex.find(
  (claim) =>
    claim.originFacts.includes('FACT-codex-006') &&
    claim.atomic === 'CAP-02.01-A01',
);
if (!codexInteractive || codexInteractive.slice.terminal !== 'tty') {
  errors.push('Codex interactive CLI terminal slice is not TTY');
}
if (
  codex
    .filter((claim) => claim.originFacts.includes('FACT-codex-045'))
    .some((claim) => claim.slice.terminal !== 'non-tty')
) {
  errors.push('Codex headless claims escaped the non-TTY slice');
}
const codexDangerousBypass = codex.find(
  (claim) =>
    claim.atomic === 'CAP-06.02-A04' &&
    claim.originFacts.includes('FACT-codex-025') &&
    claim.originFacts.includes('FACT-codex-029'),
);
if (
  !codexDangerousBypass ||
  !/dangerously-bypass-approvals-and-sandbox/.test(
    codexDangerousBypass.statement,
  ) ||
  !codexDangerousBypass.evidence.includes('EVD-codex-HELP-001') ||
  codexDangerousBypass.contract.EP !==
    'R[--dangerously-bypass-approvals-and-sandbox]' ||
  codexDangerousBypass.contract.AG !== 'R[external sandbox required]' ||
  codexDangerousBypass.contract.RM !== 'NC' ||
  codexDangerousBypass.contract.SB !== 'R[other]'
) {
  errors.push('Codex dangerous bypass entrypoint lacks normalized provenance');
}
const codexAtomicsByFact = new Map();
for (const claim of codex) {
  for (const factId of claim.originFacts) {
    const atomics = codexAtomicsByFact.get(factId) ?? new Set();
    atomics.add(claim.atomic);
    codexAtomicsByFact.set(factId, atomics);
  }
}
for (const claim of codex) {
  const factId = claim.originFacts[0];
  if (
    claim.originFacts.length !== 1 ||
    [
      'FACT-codex-004',
      'FACT-codex-023',
      'FACT-codex-025',
      'FACT-codex-050',
    ].includes(factId) ||
    (codexAtomicsByFact.get(factId)?.size ?? 0) < 2
  ) {
    continue;
  }
  const required = registry.get(claim.atomic).requiredLeaves;
  if ([...required].some((leaf) => claim.contract[leaf] !== 'NC')) {
    errors.push(
      `${claim.id}: multi-Atomic Codex contract was not conservative`,
    );
  }
}
for (const claim of codex) {
  const explicitlyProjected =
    (claim.originFacts.includes('FACT-codex-004') &&
      claim.support === 'Supported') ||
    claim.originFacts.includes('FACT-codex-023') ||
    (claim.originFacts.includes('FACT-codex-025') &&
      claim.atomic === 'CAP-06.02-A04') ||
    claim.originFacts.includes('FACT-codex-050');
  if (explicitlyProjected) continue;
  const required = registry.get(claim.atomic).requiredLeaves;
  if ([...required].some((leaf) => claim.contract[leaf] !== 'NC')) {
    errors.push(`${claim.id}: Codex keyword heuristic leaked into contract`);
  }
}

const qwenApproval = qwen.find(
  (claim) =>
    claim.originFacts.includes('FACT-qwen-code-022') &&
    claim.atomic === 'CAP-06.02-A01',
);
if (
  !qwenApproval ||
  qwenApproval.contract.AD !== 'U' ||
  qwenApproval.support !== 'Unknown' ||
  !qwenApproval.conflicts.includes('Other')
) {
  errors.push('Qwen approval conflict invariant failed');
}

const qwenTeam = qwen.filter(
  (claim) =>
    claim.originFacts.includes('FACT-qwen-code-034') &&
    claim.atomic !== 'CAP-08.05-A01',
);
if (
  qwenTeam.length !== 2 ||
  qwenTeam.some(
    (claim) =>
      claim.epistemic !== 'Unknown' ||
      claim.support !== 'Unknown' ||
      claim.lifecycle !== 'unknown' ||
      claim.future !== 'announced' ||
      !claim.conflicts.includes('Other'),
  )
) {
  errors.push('Qwen Agent Team conflict invariant failed');
}
const qwenGenericMessage = qwen.find(
  (claim) =>
    claim.originFacts.includes('FACT-qwen-code-034') &&
    claim.atomic === 'CAP-08.05-A01',
);
if (
  !qwenGenericMessage ||
  qwenGenericMessage.epistemic !== 'Confirmed' ||
  qwenGenericMessage.lifecycle !== 'not-checked' ||
  qwenGenericMessage.future !== 'not-checked' ||
  qwenGenericMessage.conflicts.length ||
  !qwenGenericMessage.originFacts.includes('FACT-qwen-code-031') ||
  !sameValues(qwenGenericMessage.evidence, [
    'EVD-qwen-code-DOC-019',
    'EVD-qwen-code-SOURCE-005',
  ]) ||
  qwenGenericMessage.contract.SX !== 'R[inter-agent message delivery]' ||
  /team_create|team_delete|team_plan|agent team/i.test(
    contractText(qwenGenericMessage),
  )
) {
  errors.push('Qwen generic messaging separation failed');
}

const qwenCliInventory = qwen.filter((claim) =>
  claim.originFacts.includes('FACT-qwen-code-003'),
);
if (qwenCliInventory.length !== 0) {
  errors.push('Qwen cross-Surface inventory was promoted to a CLI Claim');
}
if (
  qwen.some(
    (claim) =>
      claim.originFacts.includes('FACT-qwen-code-006') &&
      claim.atomic === 'CAP-02.10-A03',
  )
) {
  errors.push('Qwen unsupported layout mapping was promoted to a Claim');
}

const qwenFactCount = (factId) =>
  qwen.filter((claim) => claim.originFacts.includes(factId)).length;
if (qwenFactCount('FACT-qwen-code-024') !== 12) {
  errors.push('Qwen sandbox backend split is not 12');
}
const qwenSandbox = qwen.filter((claim) =>
  claim.originFacts.includes('FACT-qwen-code-024'),
);
const qwenBackendClaims = qwenSandbox.filter((claim) =>
  claim.configuration.some((entry) => entry.startsWith('sandbox backend=')),
);
const qwenBackendCounts = counts(
  qwenBackendClaims.map((claim) =>
    claim.configuration
      .find((entry) => entry.startsWith('sandbox backend='))
      .replace('sandbox backend=', ''),
  ),
);
if (
  !sameCounts(qwenBackendCounts, { Seatbelt: 3, Docker: 4, Podman: 4 }) ||
  new Set(qwenBackendClaims.map((claim) => claim.slice.id)).size !== 3 ||
  qwenBackendClaims.some((claim) => {
    const backend = claim.configuration
      .find((entry) => entry.startsWith('sandbox backend='))
      .replace('sandbox backend=', '');
    if (
      claim.slice.arch !== 'not-applicable' ||
      claim.slice.shell !== 'not-applicable'
    ) {
      return true;
    }
    return backend === 'Seatbelt'
      ? claim.slice.os !== 'macOS' ||
          claim.slice.isolation !== 'other' ||
          !claim.slice.configuration.includes('documented platform=macOS')
      : claim.slice.os !== 'not-applicable' ||
          claim.slice.isolation !== 'container' ||
          !claim.slice.configuration.includes('runtime platform=TBD');
  })
) {
  errors.push('Qwen sandbox backend/platform slices are not isolated');
}
if (qwenFactCount('FACT-qwen-code-039') !== 9) {
  errors.push('Qwen headless/Dual Output split is not 9');
}
const qwenOutput = qwen.filter((claim) =>
  claim.originFacts.includes('FACT-qwen-code-039'),
);
const qwenDualOutput = qwenOutput.filter((claim) =>
  claim.evidence.includes('EVD-qwen-code-DOC-031'),
);
const qwenHeadless = qwenOutput.filter(
  (claim) => !claim.evidence.includes('EVD-qwen-code-DOC-031'),
);
if (
  qwenDualOutput.length !== 1 ||
  qwenDualOutput[0].slice.terminal !== 'tty' ||
  qwenDualOutput[0].contract.RM !== 'R[interactive; tty]' ||
  !sameValues(qwenDualOutput[0].evidence, ['EVD-qwen-code-DOC-031']) ||
  qwenHeadless.length !== 8 ||
  qwenHeadless.some(
    (claim) =>
      claim.slice.terminal !== 'non-tty' ||
      claim.contract.RM !== 'R[non-interactive; non-tty]',
  )
) {
  errors.push('Qwen headless and TTY Dual Output contracts are mixed');
}
for (const [factId, atomic, expectedEvidence, expectedTerminal] of [
  [
    'FACT-qwen-code-012',
    'CAP-03.07-A01',
    ['EVD-qwen-code-TEST-001'],
    'unknown',
  ],
  [
    'FACT-qwen-code-012',
    'CAP-03.07-A02',
    ['EVD-qwen-code-TEST-001'],
    'unknown',
  ],
  [
    'FACT-qwen-code-012',
    'CAP-03.12-A01',
    ['EVD-qwen-code-SOURCE-007', 'EVD-qwen-code-TEST-002'],
    'unknown',
  ],
  [
    'FACT-qwen-code-012',
    'CAP-03.12-A02',
    ['EVD-qwen-code-DOC-008', 'EVD-qwen-code-TEST-001'],
    'non-tty',
  ],
  [
    'FACT-qwen-code-019',
    'CAP-05.04-A02',
    ['EVD-qwen-code-SOURCE-001', 'EVD-qwen-code-SOURCE-004'],
    undefined,
  ],
  [
    'FACT-qwen-code-020',
    'CAP-05.11-A01',
    [
      'EVD-qwen-code-DOC-030',
      'EVD-qwen-code-SOURCE-001',
      'EVD-qwen-code-SOURCE-004',
    ],
    undefined,
  ],
]) {
  const claim = qwen.find(
    (candidate) =>
      candidate.originFacts.includes(factId) && candidate.atomic === atomic,
  );
  if (
    !claim ||
    !sameValues(claim.evidence, expectedEvidence) ||
    (expectedTerminal && claim.slice.terminal !== expectedTerminal)
  ) {
    errors.push(`${factId}/${atomic}: direct Evidence isolation failed`);
  }
}
const qwenFact12 = Object.fromEntries(
  qwen
    .filter((claim) => claim.originFacts.includes('FACT-qwen-code-012'))
    .map((claim) => [claim.atomic, claim]),
);
if (
  Object.values(qwenFact12).some((claim) =>
    /documented CLI surface/.test(contractText(claim)),
  ) ||
  qwenFact12['CAP-03.07-A01']?.contract.CC !== 'R[steer]' ||
  qwenFact12['CAP-03.07-A02']?.contract.CE !== 'R[queued]' ||
  qwenFact12['CAP-03.12-A01']?.contract.IN !==
    'R[repeated tool calls; shell stagnation; repeated content]' ||
  qwenFact12['CAP-03.12-A02']?.contract.CL !== 'R[turn budget]'
) {
  errors.push('Qwen Fact012 contract projection is not Atomic-specific');
}
for (const claim of qwen) {
  if (
    claim.originFacts.some((factId) =>
      [
        'FACT-qwen-code-012',
        'FACT-qwen-code-022',
        'FACT-qwen-code-034',
        'FACT-qwen-code-039',
      ].includes(factId),
    )
  ) {
    continue;
  }
  const required = registry.get(claim.atomic).requiredLeaves;
  if ([...required].some((leaf) => claim.contract[leaf] !== 'NC')) {
    errors.push(`${claim.id}: Qwen keyword heuristic leaked into contract`);
  }
}
for (const [factId, atomic, expectedEvidence] of [
  ['FACT-qwen-code-002', 'CAP-01.01-A01', ['EVD-qwen-code-DOC-001']],
  [
    'FACT-qwen-code-002',
    'CAP-01.01-A02',
    ['EVD-qwen-code-DOC-001', 'EVD-qwen-code-META-002'],
  ],
  ['FACT-qwen-code-002', 'CAP-01.01-A03', ['EVD-qwen-code-DOC-001']],
  [
    'FACT-qwen-code-005',
    'CAP-02.01-A01',
    ['EVD-qwen-code-DOC-001', 'EVD-qwen-code-DOC-002'],
  ],
  ...['CAP-02.02-A01', 'CAP-02.02-A02', 'CAP-02.02-A03', 'CAP-02.02-A04'].map(
    (atomic) => ['FACT-qwen-code-005', atomic, ['EVD-qwen-code-DOC-002']],
  ),
  ...[
    'CAP-07.03-A01',
    'CAP-07.03-A02',
    'CAP-07.03-A03',
    'CAP-07.03-A04',
    'CAP-07.03-A05',
  ].map((atomic) => ['FACT-qwen-code-027', atomic, ['EVD-qwen-code-DOC-015']]),
  ...['CAP-08.06-A01', 'CAP-08.06-A02', 'CAP-08.06-A04', 'CAP-08.07-A01'].map(
    (atomic) => ['FACT-qwen-code-031', atomic, ['EVD-qwen-code-DOC-019']],
  ),
  ...['CAP-08.07-A02', 'CAP-08.07-A03', 'CAP-08.07-A05'].map((atomic) => [
    'FACT-qwen-code-031',
    atomic,
    ['EVD-qwen-code-DOC-019', 'EVD-qwen-code-SOURCE-005'],
  ]),
  [
    'FACT-qwen-code-038',
    'CAP-09.08-A02',
    [
      'EVD-qwen-code-DOC-020',
      'EVD-qwen-code-DOC-022',
      'EVD-qwen-code-HELP-004',
    ],
  ],
  ...['CAP-09.10-A01', 'CAP-09.10-A02'].map((atomic) => [
    'FACT-qwen-code-038',
    atomic,
    ['EVD-qwen-code-DOC-022'],
  ]),
  ['FACT-qwen-code-044', 'CAP-11.01-A01', ['EVD-qwen-code-DOC-025']],
  ...['CAP-11.01-A02', 'CAP-11.01-A03'].map((atomic) => [
    'FACT-qwen-code-044',
    atomic,
    ['EVD-qwen-code-DOC-024', 'EVD-qwen-code-DOC-025'],
  ]),
  ...['CAP-11.02-A01', 'CAP-11.02-A02'].map((atomic) => [
    'FACT-qwen-code-044',
    atomic,
    ['EVD-qwen-code-DOC-025'],
  ]),
  [
    'FACT-qwen-code-046',
    'CAP-11.03-A04',
    ['EVD-qwen-code-DOC-025', 'EVD-qwen-code-HELP-001'],
  ],
  [
    'FACT-qwen-code-046',
    'CAP-11.04-A01',
    ['EVD-qwen-code-DOC-002', 'EVD-qwen-code-DOC-007'],
  ],
  ...['CAP-11.04-A03', 'CAP-11.06-A02', 'CAP-11.12-A02'].map((atomic) => [
    'FACT-qwen-code-046',
    atomic,
    ['EVD-qwen-code-DOC-007', 'EVD-qwen-code-DOC-025'],
  ]),
  [
    'FACT-qwen-code-046',
    'CAP-11.06-A03',
    ['EVD-qwen-code-DOC-002', 'EVD-qwen-code-DOC-007'],
  ],
  ...['CAP-11.08-A01', 'CAP-11.08-A04'].map((atomic) => [
    'FACT-qwen-code-047',
    atomic,
    ['EVD-qwen-code-DOC-026'],
  ]),
  ...['CAP-11.09-A01', 'CAP-11.09-A02'].map((atomic) => [
    'FACT-qwen-code-047',
    atomic,
    ['EVD-qwen-code-DOC-007', 'EVD-qwen-code-DOC-026'],
  ]),
  ...[
    'CAP-12.03-A01',
    'CAP-12.03-A02',
    'CAP-12.03-A03',
    'CAP-12.03-A04',
    'CAP-12.03-A07',
  ].map((atomic) => ['FACT-qwen-code-049', atomic, ['EVD-qwen-code-DOC-037']]),
]) {
  const claim = qwen.find(
    (candidate) =>
      candidate.originFacts.includes(factId) && candidate.atomic === atomic,
  );
  if (!claim || !sameValues(claim.evidence, expectedEvidence)) {
    errors.push(`${factId}/${atomic}: Evidence invariant drift`);
  }
}
if (
  qwen.filter(
    (claim) =>
      claim.atomic === 'CAP-09.02-A01' &&
      claim.originFacts.includes('FACT-qwen-code-035') &&
      claim.originFacts.includes('FACT-qwen-code-036'),
  ).length !== 1
) {
  errors.push('Qwen duplicate PR metadata was not merged exactly once');
}

if (
  claude.filter((claim) => claim.originFacts.includes('FACT-claude-code-043'))
    .length !== 9
) {
  errors.push('Claude provider split is not 9');
}
const claudeProviders = claude.filter((claim) =>
  claim.originFacts.includes('FACT-claude-code-043'),
);
if (
  !sameCounts(counts(claudeProviders.map((claim) => claim.slice.provider)), {
    Anthropic: 3,
    'Amazon Bedrock': 3,
    'Google Vertex': 3,
  }) ||
  new Set(claudeProviders.map((claim) => claim.slice.id)).size !== 3 ||
  claudeProviders.some(
    (claim) =>
      claim.provider !== 'not-applicable' || claim.configuration.length !== 0,
  ) ||
  claudeProviders.some((claim) =>
    claim.atomic === 'CAP-11.01-A02'
      ? !claim.evidence.includes('EVD-claude-code-HELP-001')
      : claim.evidence.includes('EVD-claude-code-HELP-001'),
  )
) {
  errors.push(
    'Claude provider slices, environment deltas, or direct Evidence are mixed',
  );
}
const claudeInterrupt = claude.find(
  (claim) =>
    claim.originFacts.includes('FACT-claude-code-011') &&
    claim.atomic === 'CAP-03.08-A01',
);
if (
  !claudeInterrupt ||
  claudeInterrupt.contract.CE !== 'R[mixed]' ||
  claudeInterrupt.contract.CC !== 'R[foreground to background]' ||
  claudeInterrupt.contract.CL !== 'NC'
) {
  errors.push('Claude foreground/background control leaked into limits');
}
const claudeSubagentBudget = claude.find(
  (claim) =>
    claim.originFacts.includes('FACT-claude-code-034') &&
    claim.atomic === 'CAP-08.03-A04',
);
if (
  !claudeSubagentBudget ||
  claudeSubagentBudget.contract.CL !== 'R[200 default]' ||
  claudeSubagentBudget.contract.FS !== 'U'
) {
  errors.push('Claude subagent exhaustion evidence insufficiency was recorded');
}
const claudePermissionInheritance = claude.find(
  (claim) =>
    claim.originFacts.includes('FACT-claude-code-026') &&
    claim.atomic === 'CAP-06.08-A05',
);
if (
  !claudePermissionInheritance ||
  claudePermissionInheritance.contract.SO !== 'R[session]'
) {
  errors.push('Claude parent/child session ownership was not normalized');
}
const claudeIntegrity = claude.find(
  (claim) =>
    claim.originFacts.includes('FACT-claude-code-001') &&
    claim.atomic === 'CAP-01.06-A01',
);
if (!claudeIntegrity || claudeIntegrity.contract.SB !== 'R[other]') {
  errors.push('Claude integrity boundary escaped the security enum');
}
const claudeLatest = claude.filter(
  (claim) => claim.slice.version === '2.1.220',
);
if (
  !claudeLatest.length ||
  claudeLatest.some(
    (claim) =>
      claim.slice.os !== 'not-applicable' ||
      claim.slice.arch !== 'not-applicable' ||
      claim.slice.shell !== 'not-applicable' ||
      claim.slice.isolation !== 'not-applicable' ||
      claim.slice.authentication !== 'not-applicable' ||
      !claim.slice.id.includes('-NA-') ||
      !claim.slice.configuration.includes('binary/help not downloaded'),
  )
) {
  errors.push('Claude 2.1.220 changelog-only slice claims local artifacts');
}
const claudeSigterm = claude.find((claim) =>
  claim.originFacts.includes('FACT-claude-code-052'),
);
if (
  !claudeSigterm ||
  /\bsdk\b/i.test(`${claudeSigterm.statement} ${contractText(claudeSigterm)}`)
) {
  errors.push('Claude SIGTERM CLI claim leaked SDK semantics');
}
const claudeDirectoryAdded = claude.find((claim) =>
  claim.originFacts.includes('FACT-claude-code-054'),
);
if (
  !claudeDirectoryAdded ||
  /register_repo_root|\bsdk\b/i.test(
    `${claudeDirectoryAdded.statement} ${contractText(claudeDirectoryAdded)}`,
  )
) {
  errors.push('Claude DirectoryAdded CLI claim leaked SDK semantics');
}
if (
  claude.filter(
    (claim) =>
      claim.originFacts.includes('FACT-claude-code-023') &&
      claim.atomic === 'CAP-06.02-A01',
  ).length !== 2
) {
  errors.push('Claude stable/preview permission split is not 2');
}
if (
  claude.filter(
    (claim) =>
      claim.atomic === 'CAP-08.07-A02' &&
      claim.originFacts.includes('FACT-claude-code-031') &&
      claim.originFacts.includes('FACT-claude-code-033'),
  ).length !== 1
) {
  errors.push('Claude roster duplicate was not merged exactly once');
}
for (const [atomic, expectedEvidence] of [
  [
    'CAP-11.09-A01',
    ['EVD-claude-code-DOC-022', 'EVD-claude-code-CHANGELOG-001'],
  ],
  ['CAP-11.09-A02', ['EVD-claude-code-DOC-022']],
  ['CAP-11.09-A05', ['EVD-claude-code-HELP-001']],
]) {
  const claim = claude.find(
    (candidate) =>
      candidate.originFacts.includes('FACT-claude-code-047') &&
      candidate.atomic === atomic,
  );
  if (!claim || !sameValues(claim.evidence, expectedEvidence)) {
    errors.push(`Claude Fact047/${atomic}: Evidence isolation failed`);
  }
}
for (const claim of claude) {
  const factId = claim.originFacts[0];
  let expectedTerminal;
  if (['FACT-claude-code-009', 'FACT-claude-code-010'].includes(factId)) {
    expectedTerminal = 'both';
  } else if (factId === 'FACT-claude-code-047') {
    expectedTerminal = claim.atomic === 'CAP-11.09-A05' ? 'non-tty' : 'tty';
  } else if (
    [
      'FACT-claude-code-039',
      'FACT-claude-code-040',
      'FACT-claude-code-041',
      'FACT-claude-code-046',
      'FACT-claude-code-049',
      'FACT-claude-code-052',
      'FACT-claude-code-056',
    ].includes(factId)
  ) {
    expectedTerminal = 'non-tty';
  }
  if (expectedTerminal && claim.slice.terminal !== expectedTerminal) {
    errors.push(`${claim.id}: Claude terminal slice drift`);
  }
}

const coverage = fs.readFileSync(
  path.join(root, '07-phase-1c-coverage-and-open-claims.md'),
  'utf8',
);
const normalization = fs.readFileSync(
  path.join(root, '06-phase-1c-claim-normalization.md'),
  'utf8',
);
for (const [label, report] of [
  ['normalization', normalization],
  ['coverage', coverage],
]) {
  if (
    !/> 状态：Frozen/.test(report) ||
    !new RegExp(`> Frozen at：${phase1CReviewedAt}`).test(report)
  ) {
    errors.push(`${label} report is not frozen at Claim last_checked`);
  }
}
if (
  !/`Partial`：直接 Evidence 已闭合 Atomic validation criterion 中至少一个可观察\s+行为或门禁/.test(
    normalization,
  ) ||
  !/仅发现入口、文档承诺、源码分支或测试文件本身不构成 `Partial`/.test(
    normalization,
  ) ||
  !/单 Atomic Fact 也不因关键词命中自动生成业务值/.test(normalization) ||
  !/`not described`[\s\S]{0,120}统一投影为 `U`/.test(normalization)
) {
  errors.push('normalization report has an unsafe support/contract rule');
}

const productLabels = {
  codex: 'Codex',
  'claude-code': 'Claude Code',
  'qwen-code': 'Qwen Code',
};
const summarySection = section(coverage, '## 1. 结论摘要', '## 2. 状态分布');
const supportSection = section(
  coverage,
  '### 2.1 Support state',
  '### 2.2 Epistemic',
);
const assessmentSection = section(
  coverage,
  '### 2.2 Epistemic',
  '### 2.3 Lifecycle',
);
const lifecycleSection = section(
  coverage,
  '### 2.3 Lifecycle',
  '## 3. Behavior Contract',
);
const contractSection = section(
  coverage,
  '## 3. Behavior Contract',
  '## 4. Deferred Register',
);
const derivedStats = Object.fromEntries(
  Object.entries(claims).map(([product, productClaims]) => [
    product,
    coverageStats(productClaims, registry),
  ]),
);
const derivedTotals = {
  claims: 0,
  slices: 0,
  Supported: 0,
  Partial: 0,
  Unknown: 0,
  'Not supported': 0,
};
for (const [product, stats] of Object.entries(derivedStats)) {
  const label = productLabels[product];
  const summaryRow = markdownRow(summarySection, label);
  const supportRow = markdownRow(supportSection, label);
  const assessmentRow = markdownRow(assessmentSection, label);
  const lifecycleRow = markdownRow(lifecycleSection, label);
  const contractRow = markdownRow(contractSection, label);
  if (
    !summaryRow ||
    numericCell(summaryRow[2]) !== stats.claims ||
    numericCell(summaryRow[3]) !== stats.atoms ||
    numericCell(summaryRow[4]) !== stats.facts ||
    numericCell(summaryRow[5]) !== stats.slices
  ) {
    errors.push(`${product}: coverage summary is not derived from Claims`);
  }
  const supportOrder = ['Supported', 'Partial', 'Unknown', 'Not supported'];
  if (
    !supportRow ||
    supportOrder.some(
      (state, index) =>
        numericCell(supportRow[index + 1]) !== (stats.support[state] ?? 0),
    )
  ) {
    errors.push(`${product}: coverage support distribution drift`);
  }
  if (
    !assessmentRow ||
    !sameCounts(inlineCountMap(assessmentRow[1]), stats.epistemic) ||
    !sameCounts(inlineCountMap(assessmentRow[2]), stats.runtime) ||
    !sameCounts(inlineCountMap(assessmentRow[3]), stats.confidence)
  ) {
    errors.push(`${product}: coverage assessment distribution drift`);
  }
  if (
    !lifecycleRow ||
    !sameCounts(inlineCountMap(lifecycleRow[1]), stats.lifecycle)
  ) {
    errors.push(`${product}: coverage lifecycle distribution drift`);
  }
  const ratio = Number(
    (100 * (stats.leaf.recorded / stats.leaf.required)).toFixed(1),
  );
  if (
    !contractRow ||
    numericCell(contractRow[1]) !== stats.leaf.required ||
    numericCell(contractRow[2]) !== stats.leaf.recorded ||
    numericCell(contractRow[3]) !== stats.leaf.NC ||
    numericCell(contractRow[4]) !== stats.leaf.U ||
    numericCell(contractRow[5]) !== stats.leaf.NA ||
    Number(contractRow[6]?.replaceAll(/[*%]/g, '')) !== ratio
  ) {
    errors.push(`${product}: coverage contract distribution drift`);
  }
  derivedTotals.claims += stats.claims;
  derivedTotals.slices += stats.slices;
  for (const state of supportOrder) {
    derivedTotals[state] += stats.support[state] ?? 0;
  }
}
const summaryTotal = markdownRow(summarySection, '合计');
const supportTotal = markdownRow(supportSection, '合计');
if (
  !new RegExp(`正式 Claim：${derivedTotals.claims}\\b`).test(coverage) ||
  !summaryTotal ||
  numericCell(summaryTotal[2]) !== derivedTotals.claims ||
  numericCell(summaryTotal[5]) !== derivedTotals.slices ||
  !supportTotal ||
  ['Supported', 'Partial', 'Unknown', 'Not supported'].some(
    (state, index) =>
      numericCell(supportTotal[index + 1]) !== derivedTotals[state],
  )
) {
  errors.push('coverage totals are not derived from Claims');
}

for (const [label, pattern] of [
  ['primary relation policy', /只有一个 primary relation/],
  ['Dual Output support', /Dual Output `DOC-031` 只 `supports`/],
  [
    'Codex cloud apply deferral',
    /FACT-codex-023 \/ CAP-05\.03-A03.+cloud entries/,
  ],
  [
    'Codex exec-server deferral',
    /FACT-codex-050 \/ CAP-10\.12-A01\/A03.+exec-server/,
  ],
  ['Codex sdk-daemon count', /8 个 Fact→Atomic row \/ 6 distinct atom/],
  ['Codex dangerous bypass provenance', /FACT-codex-029[\s\S]{0,180}A04/],
  ['Qwen secondary-Surface count', /1C\.2 有 52 条/],
  ['Qwen IDE deferred count', /\| IDE\s+\|\s+4\s+\|\s+0\s+\|/],
  ['Qwen Desktop deferred count', /\| Desktop\s+\|\s+0\s+\|\s+0\s+\|/],
  ['Qwen SDK deferred count', /\| SDK \/ daemon\s+\|\s+27\s+\|\s+12\s+\|/],
  ['Qwen CI deferred count', /\| CI\s+\|\s+6\s+\|\s+0\s+\|/],
  ['Qwen IM deferred count', /\| IM bot\s+\|\s+3\s+\|\s+0\s+\|/],
  ['Qwen cross-Surface deferral', /FACT-qwen-code-003.+CAP-01\.08-A01/],
  ['Qwen layout deferral', /FACT-qwen-code-006.+CAP-02\.10-A03/],
  [
    'approval default conflict',
    /CAP-06\.02-A01\.availability\.default_state=U/,
  ],
  ['Agent Team commitment', /future_commitment=announced/],
]) {
  if (!pattern.test(coverage)) {
    errors.push(`coverage report missing invariant: ${label}`);
  }
}

const probes = fs.readFileSync(
  path.join(root, 'probes', '01-cli-core-runtime-probes.md'),
  'utf8',
);
const cloudProbe = section(
  probes,
  '### `PRB-CLI-017`',
  '## 5. 1C.1 执行顺序建议',
);
const subagentProbe = section(probes, '### `PRB-CLI-012`', '### `PRB-CLI-013`');
const worktreeProbe = section(probes, '### `PRB-CLI-013`', '### `PRB-CLI-015`');
if (
  !/CAP-02\.08-A01\/A02\/A03/.test(cloudProbe) ||
  !/CAP-08\.12-A01/.test(cloudProbe) ||
  !/CAP-10\.12-A01\/A03/.test(cloudProbe)
) {
  errors.push('Codex cloud probe does not close every formal cloud Claim');
}
if (
  !/CAP-08\.09/.test(probes) ||
  !/grandchild/.test(subagentProbe) ||
  !/ancestry/.test(subagentProbe) ||
  !/record forwarding/.test(subagentProbe)
) {
  errors.push('Subagent probe omits recursive execution contract');
}
if (
  !/\| `PRB-CLI-013`[\s\S]*?\| 1C\.2\s+\| 是\s+\| 是\s+\|/.test(probes) ||
  !/1C\.1 没有可由本 probe 更新的 Codex CLI Claim/.test(worktreeProbe)
) {
  errors.push('Codex worktree probe was not deferred to 1C.2');
}
for (const [label, pattern] of [
  ['TTY Dual Output probe', /PRB-CLI-002B/],
  ['reverse-command stream', /reverse-command stream/],
  ['sandbox backend matrix', /backend × platform 切片/],
  ['Claude bubblewrap slice', /Claude Code \| bubblewrap/],
  ['Qwen Podman slice', /Qwen Code\s+\| Podman/],
  ['Codex cloud CLI probe', /PRB-CLI-017` Codex cloud task CLI/],
  ['Codex cloud risk split', /cloud list\/status\/diff.+`R2`/],
  [
    'Codex exec-server surface boundary',
    /exec-server[\s\S]{0,100}1C\.2 `sdk-daemon`/,
  ],
]) {
  if (!pattern.test(probes)) {
    errors.push(`probe catalog missing invariant: ${label}`);
  }
}

if (errors.length) {
  process.stderr.write(`${errors.join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    'Phase 1C.1 validation passed: 425 claims, exact versions, contract/relation closure, conflicts preserved.\n',
  );
}
