function refresh_site(page) {
    NProgress.start();
    $.ajax({
        url: '/' + page,
        type: 'GET',
        dataType: "html",
        data: {}
    }).done(function (data) {
        var content = $(data).find('#content').html();
        $("#content").html(content);
        var scripts = $(data).find('#content-scripts').html();
        $('#content-scripts').html(scripts);
        history.pushState(null, null, '/' + page);
        NProgress.done();
        jQuery(window).trigger('load');
    });
}