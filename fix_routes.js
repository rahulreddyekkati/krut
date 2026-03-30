const fs = require('fs');
const files = [
  'src/app/api/stores/[id]/route.ts',
  'src/app/api/markets/[id]/route.ts',
  'src/app/api/jobs/[id]/route.ts',
  'src/app/api/jobs/[id]/clock-in/route.ts',
  'src/app/api/jobs/[id]/clock-out/route.ts',
  'src/app/api/users/[id]/route.ts',
  'src/app/api/users/[id]/assignments/route.ts'
];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\{ params \}: \{ params: \{ ([a-zA-Z0-9_]+): string \} \}/g, 'context: { params: Promise<{ $1: string }> }');
  content = content.replace(/await params/g, 'await context.params');
  content = content.replace(/const \{ ([a-zA-Z0-9_]+) \} = params;/g, 'const { $1 } = await context.params;');
  fs.writeFileSync(file, content);
}
