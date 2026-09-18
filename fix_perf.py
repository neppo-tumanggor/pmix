filepath = 'apps/backend/src/modules/products/scripts/run-performance-test.ts'
with open(filepath, 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if 'const dataSource = AppDataSource;' in line:
        new_lines.append('  await dataSource.initialize();\n')

with open(filepath, 'w') as f:
    f.writelines(new_lines)

print('Fixed initialize call')