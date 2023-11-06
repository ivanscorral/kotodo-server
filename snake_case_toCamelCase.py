import os
import re

def snake_to_camel(word):
    return ''.join(x.capitalize() or '_' for x in word.split('_'))

for dirpath, dirnames, filenames in os.walk('./src'):
    for filename in filenames:
        if filename.endswith('.ts') and '_' in filename:
            new_name = snake_to_camel(filename.replace('.ts', '')) + '.ts'
            os.rename(os.path.join(dirpath, filename), os.path.join(dirpath, new_name))
