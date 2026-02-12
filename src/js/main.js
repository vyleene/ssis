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

function initDataTable(tableId) {
    if(typeof $ === 'undefined' || typeof $.fn.DataTable === 'undefined') return;

    const $table = $(`#${tableId}`);
    if(!$table.length) return;

    if($.fn.DataTable.isDataTable($table)) $table.DataTable().destroy();

    $table.DataTable({
        responsive: true,
        fixedHeader: true,
        paging: true,
        lengthChange: false,
    });
}

function refreshDataTable(tableId) {
    if(typeof $ === 'undefined' || typeof $.fn.DataTable === 'undefined') return;

    const $table = $(`#${tableId}`);
    if(!$table.length) return;

    if($.fn.DataTable.isDataTable($table)) {
        const rows = $table.find('tbody tr').toArray();
        const dataTable = $table.DataTable();
        dataTable.clear();
        dataTable.rows.add(rows).draw(false);
    } else {
        initDataTable(tableId);
    }
}

$(document).ready(async () => {
    await Promise.all(csvConfigs.map(config => loadCsvToTable(config)));
    csvConfigs.forEach(config => initDataTable(config.tableId));
    
    initTitleBar();
    initDirectoryNav();
});

Neutralino.init();