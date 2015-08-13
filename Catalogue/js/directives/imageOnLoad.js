app.directive('imageonload', function ($compile) {
    return {
        restrict: 'A',
        scope: '@',
        replace: false,
        priority: 1000,
        link: function (scope, element, attrs) {
            element.bind('load', function () {
                var el = angular.element('<tag class="tags-directive" item="item" entityname="\'Item\'" fieldname="\'Tags\'"></tag>');
                //var childScope = scope.$new();
                //childScope.item = scope.item;
                $compile(el)(scope);
                element.parent().append(el);
                
            });
        }
    };
});