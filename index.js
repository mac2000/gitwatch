const {app, BrowserWindow, Menu, Tray} = require('electron')
const path = require('path')
const url = require('url')

if (process.argv.indexOf('-w') !== -1) {
	require('electron-reload')(__dirname)
}

let wnd
let tray

const createWindow = () => {
	wnd = new BrowserWindow({icon: 'images/icon.png', width: 800, height: 600})

	wnd.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}))

	wnd.setMenu(null)
	if (process.argv.indexOf('-w') !== -1) wnd.webContents.openDevTools()

	wnd.on('minimize', event => {
		event.preventDefault()
		wnd.hide()
	})

	wnd.on('close', event => {
		if (!app.isQuiting) {
			event.preventDefault()
			wnd.hide()
		}
		return false
	})

	wnd.on('closed', () => wnd = null)
}

const createTray = () => {
	tray = new Tray('images/icon.png')
	const menu = Menu.buildFromTemplate([
		{label: 'Open', /*icon: 'images/icon.png',*/ click: () => wnd.show()},
		// {label: 'Item1', type: 'radio'},
		// {label: 'Item2', type: 'radio'},
		// {label: 'Item3', type: 'radio', checked: true},
		// {label: 'Item4', type: 'radio'},
		{label: 'Quit', click: () => {
			app.isQuiting = true
			app.quit()
		}}
	])
	tray.setToolTip('gitwatch')
	tray.setContextMenu(menu)
	tray.on('double-click', () => wnd.show())
	//tray.displayBalloon({title: 'Hello World', content: 'acme'})
}

app.on('ready', () => {
	createTray()
	createWindow()
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
	if (wnd === null) createWindow()
})
