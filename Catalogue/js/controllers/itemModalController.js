app.controller('itemModalController', function ($scope, $rootScope, $http, $upload, $mdDialog, selectedItem, parentScope) {
    // Assigned from construction <code>locals</code> options...
    $scope.parentScope = parentScope;
    $scope.selectedItem = selectedItem;

    $scope.init = function () {
        if ($scope.selectedItem.model3D) {
            var scene = new THREE.Scene();
            var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

            var renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);

            camera.position.z = 5;



            // instantiate a loader
            var loader = new THREE.JSONLoader();

            // load a resource
            loader.load(
                // resource URL

               $scope.parentScope.apiRootUrl + "/" + $scope.selectedItem.model3D,
                // Function when resource is loaded
                function (geometry, materials) {
                    var material = new THREE.MeshFaceMaterial(materials);
                    var object = new THREE.Mesh(geometry, material);
                    scene.add(object);
                }
            );

            var render = function () {
                requestAnimationFrame(render);

                renderer.render(scene, camera);
            };

            render();
        }
       
    }

    $scope.closeDialog = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide();
    };

    $scope.modalMouseWheel = function (event) {
        event.stopPropagation();
    }

    $scope.updateAttachment = function ($files, $event, fieldName) {
         var item = $scope.selectedItem;
        if ($files.length == 0)
            return;
         $scope.parentScope.removeAttachment(item, fieldName);
         var fileReader = new FileReader();
         fileReader.onload = function (e) {
             $scope.upload =
                 $upload.http({
                     url: $rootScope.apiRootUrl + '/static/' + item.Id + '/' + file.name,
                     method: "PUT",
                     headers: { 'Content-Type': file.type },
                     data: e.target.result
                 }).progress(function (evt) {
                     // Math.min is to fix IE which reports 200% sometimes
                     //   $scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                     console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                 }).success(function (data, status, headers, config) {
                     // mise à jour du livre avec l'URI de l'image
                     $scope.parentScope.setAttachment(file.name, item, fieldName);

                 }).error(function (err) {
                     alert('Error occured during upload');
                 });
         }
         fileReader.readAsArrayBuffer(file);

     };
});
