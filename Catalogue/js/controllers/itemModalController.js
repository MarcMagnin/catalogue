app.controller('itemModalController', function ($scope, $rootScope, $http, $upload, $mdDialog, selectedItem, parentScope) {
    // Assigned from construction <code>locals</code> options...
    $scope.parentScope = parentScope;
    $scope.selectedItem = selectedItem;

    // Texture CORS problem : http://stackoverflow.com/questions/30853339/three-js-collada-textures-not-loading

    $scope.init = function () {
        if ($scope.selectedItem.model3D) {
            setTimeout(function () {
                var container = document.getElementById('modalContainer');
                container.innerHTML = "";
                console.log(container.offsetWidth)
                var camera = new THREE.PerspectiveCamera(60, container.offsetWidth / container.offsetHeight, 1, 1000);
                camera.up.set(0, 0, 1);
                camera.position.z = 20;
                camera.position.y = -30;
                camera.position.x = -10;

                var controls = new THREE.OrbitControls(camera);
                controls.addEventListener('change', render);



                var scene = new THREE.Scene();
                //  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                // lights

                light = new THREE.DirectionalLight(0xffffff);
                light.castShadow = true;
                light.shadowDarkness = 0.5;
                light.position.set(-10, -30, 20);
                //light.shadowCameraVisible = true;
                scene.add(light);


                light = new THREE.AmbientLight(0x222222);
                scene.add(light);


                var renderer = new THREE.WebGLRenderer({ antialias: true });
                renderer.setSize(container.offsetWidth, container.offsetHeight);
                renderer.setPixelRatio(window.devicePixelRatio);
                renderer.shadowMapEnabled = true;
                renderer.shadowMapDarkness = 0.9;
                renderer.gammaInput = true;
                renderer.gammaOutput = true;
                renderer.shadowMapSoft = true;
                renderer.shadowMapCullFace = THREE.CullFaceBack;

             
                container.appendChild(renderer.domElement);


                function render() {
                    renderer.render(scene, camera);


                }

                function animate() {

                    requestAnimationFrame(animate);
                    controls.update();
                    render();

                }


                var loader = new THREE.ColladaLoader();
                console.log(loader)
                loader.load(
                    // resource URL
                    $scope.parentScope.apiRootUrl + "/" + $scope.selectedItem.model3D,
                    // Function when resource is loaded
                    function (collada) {
                        dae = collada.scene;
                        dae.castShadow = true;
                        dae.receiveShadow = true;
                        dae.traverse(function (child) {
                            if (child instanceof THREE.Mesh) {
                                 child.castShadow = true;
                                 child.receiveShadow = true;
                            }
                        });
                        scene.add(dae);

                        render();
                        animate()
                    },
                    // Function called when download progresses
                    function (xhr) {
                        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                    }
                );


                window.addEventListener('resize', onWindowResize, false);

                animate();

                function onWindowResize() {

                    camera.aspect = container.offsetWidth / container.offsetHeight;
                    camera.updateProjectionMatrix();

                    renderer.setSize(container.offsetWidth, container.offsetHeight);

                    render();

                }


            }, 300);
           
            //// instantiate a loader
            //var loader = new THREE.JSONLoader();

            //// load a resource
            //loader.load(
            //    // resource URL
            //   $scope.parentScope.apiRootUrl + "/" + $scope.selectedItem.model3D,
            //    // Function when resource is loaded
            //    function (geometry, materials) {
            //        var material = new THREE.MeshFaceMaterial(materials);
            //        var object = new THREE.Mesh(geometry, material);
            //        scene.add(object);
            //    }
            //);

         

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
    $scope.update = function () {
        // put tags before to get id back  
        $http({
            method: 'PUT',
            headers: { 'Raven-Entity-Name': $scope.parentScope.entityname },
            url: $rootScope.apiRootUrl + '/docs/' + $scope.selectedItem.Id,
            data: angular.toJson($scope.selectedItem)
        }).
            success(function (data, status, headers, config) {
            }).
            error(function (data, status, headers, config) {

            });
    };
    $scope.updateTextures = function ($files, $event, fieldName) {
        var item = $scope.selectedItem;
        item.textures = [];
        angular.forEach($files, function (file, key) {
            item.textures.push(file.name);
        });

        $scope.update();
        angular.forEach($files, function (file, key) {
            var fileReader = new FileReader();
            fileReader.onload = function (e) {
                $upload.http({
                    url: $rootScope.apiRootUrl + '/static/' + item.Id + '/maison/' + file.name,
                    method: "PUT",
                    headers: { 'Content-Type': file.type },
                    data: e.target.result
                }).progress(function (evt) {
                    // Math.min is to fix IE which reports 200% sometimes
                    //   $scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                    console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                }).success(function (data, status, headers, config) {
                    // mise à jour du livre avec l'URI de l'image
                    // $scope.setAttachment(file.name, item, 'Image');

                }).error(function (err) {
                    alert('Error occured during upload');
                });
            }
            fileReader.readAsArrayBuffer(file);
        });
    };

    $scope.updateAttachment = function ($files, $event, fieldName) {
         var item = $scope.selectedItem;
        if ($files.length == 0)
            return;
        var file = $files[0];
        var extension = getFileExtension(file.name);
        if (extension != "jpg" || extension != "jpeg" || extension != "png") {
            fieldName = "model3D";
        }

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
