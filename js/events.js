
template.load([
    {path: '../views/gem.html', name: 'gem'},
    {path: '../views/owners.html', name: 'owners'}
]);


$(function () {
    $('[name=gem]').typeahead({
        name: 'gems',
        remote: '/search/%QUERY',
        limit: 30
    })
    .on('typeahead:selected', function (obj, datum) {
        window.location.pathname = '/gem/'+datum.value;
    });

    var timeout = null;
    $('[name=gem]').on('keyup', function (e) {
        window.clearInterval(timeout);
        if (!$('.tt-dropdown-menu').is(':visible'))
            $('.loading-search').show();
        timeout = window.setInterval(function () {
            if ($('.tt-dropdown-menu').is(':visible')) {
                window.clearInterval(timeout);
                $('.loading-search').hide();
            }
        }, 200);
    });

    $('.toggle-names').on('click', function (e) {
        $(this).is(':checked') ? $('text').show() : $('text').hide();
    });

    $('body').on('click', function (e) {
        if (!/^(body|svg)$/i.test(e.target.nodeName)) return true;

        $('circle').each(function (index) {
            switch ($(this).attr('type')) {
                case 'root': var color = graph.color.blue; break;
                case 'gem' : var color = graph.color.green; break;
            }
            $(this).attr('fill', color).attr('active', false);
        });
        $('path').each(function (index) {
            $(this).attr('stroke', 'gray');
        });
        $('#gem').hide();
    });
});
