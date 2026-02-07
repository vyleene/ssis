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

    Neutralino.events.on('windowClose', () => Neutralino.app.exit());
}

function initDirectoryNav() {
    const $navItems = $('.app-nav__item');
    const $panels = $('.directory-panel');

    $navItems.on('click', function() {
        const target = $(this).attr('data-panel');

        $navItems.removeClass('is-active');
        $(this).addClass('is-active');

        $panels.each((_, panel) => {
            const $panel = $(panel);
            const isActive = $panel.attr('data-panel') === target;
            $panel.toggleClass('is-active', isActive);
        });

        if(typeof $ !== 'undefined' && $.fn.DataTable) $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust().responsive.recalc();
    });
}

Neutralino.init();