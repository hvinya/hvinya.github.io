import io, os
from shutil import copy


title = input('Enter poesy title: ')

while True:
  sign = input('Enter author(J/B): ')
  if sign in 'JB':
    break

while True:
  file = input('Enter raw poesy file: ')
  if os.path.exists(file):
    break

num = hex(len(os.listdir('poesy')))

try:
  os.mkdir('result')
except:
  pass

with io.open(f'result/{num}.md', mode='w', encoding='utf-8') as f:
  raw = io.open(file, mode='r', encoding='utf-8').read()

  poesy = f'''---
layout: default
title: {title}
permalink: /poesy/{num}/
---

```
「 {title} 」

{raw.rstrip()}
{20 * " "}{sign}
```'''
  f.write(poesy)
  print(f'Successfully wrote result/{num}.md')


with io.open(f'result/index.md', mode='w', encoding='utf-8') as f:
  prev = io.open('index.md', mode='r', encoding='utf-8').read()

  index = f'''{prev.rstrip()}
- [{title}](/poesy/{num}/)
'''
  f.write(index)
  print('Successfully wrote result/index.md')


decision = input('Update poesy folder and index.md?[Y/N]: ')
if decision:
  copy(f'result/{num}.md', 'poesy/')
  copy('result/index.md', '.')