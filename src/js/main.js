$(document).ready(async () => {
    initTitleBar();
});

function initTitleBar() {
    const $titleBar = $('#app-titlebar');
    const $minimizeBtn = $('#btn-minimize');
    const $closeBtn = $('#btn-close');

    if($titleBar.length) Neutralino.window.setDraggableRegion($titleBar[0], { exclude: [$minimizeBtn[0], $closeBtn[0]].filter(Boolean) });
    if($minimizeBtn.length) $minimizeBtn.on('click', async () => Neutralino.window.minimize());
    if($closeBtn.length) $closeBtn.on('click', async () => Neutralino.app.exit());

    Neutralino.events('windowClose', () => Neutralino.app.exit());
}

Neutralino.init();