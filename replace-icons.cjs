const fs = require('fs')
const path = require('path')

function walk(dir) {
  let results = []
  const list = fs.readdirSync(dir)
  list.forEach(file => {
    file = path.join(dir, file)
    const stat = fs.statSync(file)
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file))
    } else if (file.endsWith('.js') || file.endsWith('.vue') || file.endsWith('.css')) {
      results.push(file)
    }
  })
  return results
}

const files = walk(path.join(__dirname, 'src'))

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8')
  let changed = false
  if (content.includes('i-fa-solid:')) {
    content = content.replace(/i-fa-solid:([a-z0-9-]+)/g, 'fa-solid fa-$1')
    changed = true
  }
  if (content.includes('i-fa-regular:')) {
    content = content.replace(/i-fa-regular:([a-z0-9-]+)/g, 'fa-regular fa-$1')
    changed = true
  }
  if (changed) {
    fs.writeFileSync(file, content, 'utf8')
    console.log('Updated:', file)
  }
}
