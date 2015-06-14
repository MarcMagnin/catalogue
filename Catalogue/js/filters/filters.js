
app.filter('suggestionfilter', function () {
    return function (array, value) {
        console.log(array['$$state'])
        var selected = new array();
        if ($.grep(array, function (e) { return e == value; }).length == 0) {
            selected.push(e)
        }
        return selected;
    };
});