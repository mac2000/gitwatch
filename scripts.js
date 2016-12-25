const {Observable, Subject, BehaviorSubject} = require('rxjs')
const fs = require('fs')
const path = require('path')
const git = require('simple-git')
const interval = 5000

let prev = {}
let stats = {}

const update = repo => git(repo).fetch((err, data) => git(repo).status((err, status) => {
	prev[repo] = stats[repo]
	stats[repo] = JSON.parse(JSON.stringify(status))
	render()
}))

const render = () => {
	tblRepositories.innerHTML = Object.keys(stats).map(repo => {
		return `
			<tr>
				<td class="repo" title="${repo}">
					${path.basename(repo)}
				</td>
				<td title="branch" class="branch branch-${stats[repo].current}">
					${stats[repo].current}
				</td>
				<td title="conflicted" class="muted conflicted conflicted-${stats[repo].conflicted.length}">
					&#9888; ${stats[repo].conflicted.length}
				</td>
				<td title="created" class="muted created created-${stats[repo].created.length}">
					+ ${stats[repo].created.length}
				</td>
				<td title="deleted" class="muted deleted deleted-${stats[repo].deleted.length}">
					- ${stats[repo].deleted.length}
				</td>
				<td title="modified" class="muted modified modified-${stats[repo].modified.length}">
					~ ${stats[repo].modified.length}
				</td>
				<td title="not_added" class="muted not_added not_added-${stats[repo].not_added.length}">
					? ${stats[repo].not_added.length}
				</td>
				<td title="renamed" class="muted renamed renamed-${stats[repo].renamed.length}">
					&#177; ${stats[repo].renamed.length}
				</td>
				<td title="ahead" class="ahead ahead-${stats[repo].ahead}">
					&#9650; ${stats[repo].ahead}
				</td>
				<td title="behind" class="behind behind-${stats[repo].behind}">
					&#9660; ${stats[repo].behind}
				</td>
			</tr>
		`
	}).join('')
}

fs.readFileSync('repositories.txt', 'utf8')
	.split('\n').map(l => l.trim()).filter(l => l.length > 0)
	.filter(p => fs.existsSync(path.join(p, '.git/refs/remotes')))
	.forEach(repo => {
		prev[repo] = stats[repo] = {current: 'unknown', ahead: 0, behind: 0, conflicted: [], created: [], deleted: [], modified: [], not_added: [], renamed: []}
		update(repo)
		setInterval(() => update(repo), interval)
	})

render()

setTimeout(() => {
	setInterval(() => {
		if (JSON.stringify(prev) !== JSON.stringify(stats)) {
			new Notification('gitwatch', { body: 'change detected', icon: 'images/icon.png' })
		}
	}, interval)
}, interval)


