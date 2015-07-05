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
                var camera = new THREE.PerspectiveCamera(60, container.offsetWidth / container.offsetHeight, 1, 1000);
                camera.up.set(0, 0, 1);
                camera.position.x = -30;
                camera.position.y = -15;
                camera.position.z = 15;
                
                

                var controls = new THREE.OrbitControls(camera, container);
                controls.addEventListener('change', render);



                var scene = new THREE.Scene();
                //  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                // lights


                /*datGUI controls object*/
                guiControls = new function () {
                    this.rotationX = 0.0;
                    this.rotationY = 0.0;
                    this.rotationZ = 0.0;

                    this.lightX = -50;
                    this.lightY = -60;
                    this.lightZ = 90;
                    this.intensity = 2;
                    this.distance = 373;
                    this.angle = 1.6;
                    this.exponent = 1;
                    this.shadowCameraNear = 34;
                    this.shadowCameraFar = 2635;
                    this.shadowCameraFov = 68;
                    this.shadowCameraVisible = false;
                    this.shadowMapWidth = 1512;
                    this.shadowMapHeight = 1512;
                    this.shadowBias = 0.00;
                    this.shadowDarkness = 0.45;

                }
                /*adds spot light with starting parameters*/
                spotLight = new THREE.SpotLight(0xffffff);
                spotLight.castShadow = true;
                spotLight.position.set(-50, -60, 90);
                spotLight.intensity = guiControls.intensity;
                spotLight.distance = guiControls.distance;
                spotLight.angle = guiControls.angle;
                spotLight.exponent = guiControls.exponent;
                spotLight.shadowCameraNear = guiControls.shadowCameraNear;
                spotLight.shadowCameraFar = guiControls.shadowCameraFar;
                spotLight.shadowCameraFov = guiControls.shadowCameraFov;
                spotLight.shadowMapWidth = guiControls.shadowMapWidth;
                spotLight.shadowMapHeight = guiControls.shadowMapHeight;
                spotLight.shadowCameraVisible = guiControls.shadowCameraVisible;
                spotLight.shadowBias = guiControls.shadowBias;
                spotLight.shadowDarkness = guiControls.shadowDarkness;
                scene.add(spotLight);

                /*adds controls to scene*/
                datGUI = new dat.GUI({ autoPlace: true });
                datGUI.domElement.id = 'datGUI';
                var customContainer = $('.modalContainerDrop').append($(datGUI.domElement));

                datGUI.add(guiControls, 'lightX', -180, 180).onChange(function (value, event) {
                    spotLight.position.set(guiControls.lightX, guiControls.lightY, guiControls.lightZ);
                    spotLight.shadowCamera.updateProjectionMatrix();
                });
                datGUI.add(guiControls, 'lightY', -180, 180).onChange(function (value) {
                    spotLight.position.set(guiControls.lightX, guiControls.lightY, guiControls.lightZ);
                    spotLight.shadowCamera.updateProjectionMatrix();
                });
                datGUI.add(guiControls, 'lightZ', -180, 180).onChange(function (value) {
                    spotLight.position.set(guiControls.lightX, guiControls.lightY, guiControls.lightZ);
                    spotLight.shadowCamera.updateProjectionMatrix();
                });

                datGUI.add(guiControls, 'intensity', 0.01, 5).onChange(function (value) {
                    spotLight.intensity = value;
                });
               
                datGUI.add(guiControls, 'distance', 0, 1000).onChange(function (value) {
                    spotLight.distance = value;
                });
                datGUI.add(guiControls, 'angle', 0.001, 1.570).onChange(function (value) {
                    spotLight.angle = value;
                });
                datGUI.add(guiControls, 'exponent', 0, 50).onChange(function (value) {
                    spotLight.exponent = value;
                });
                datGUI.add(guiControls, 'shadowCameraNear', 0, 100).name("Near").onChange(function (value) {
                    spotLight.shadowCamera.near = value;
                    spotLight.shadowCamera.updateProjectionMatrix();
                });
                datGUI.add(guiControls, 'shadowCameraFar', 0, 5000).name("Far").onChange(function (value) {
                    spotLight.shadowCamera.far = value;
                    spotLight.shadowCamera.updateProjectionMatrix();
                });
                datGUI.add(guiControls, 'shadowCameraFov', 1, 180).name("Fov").onChange(function (value) {
                    spotLight.shadowCamera.fov = value;
                    spotLight.shadowCamera.updateProjectionMatrix();
                });
                datGUI.add(guiControls, 'shadowCameraVisible').onChange(function (value) {
                    spotLight.shadowCameraVisible = value;
                    spotLight.shadowCamera.updateProjectionMatrix();
                });
                datGUI.add(guiControls, 'shadowBias', 0, 1).onChange(function (value) {
                    spotLight.shadowBias = value;
                    spotLight.shadowCamera.updateProjectionMatrix();
                });
                datGUI.add(guiControls, 'shadowDarkness', 0, 1).onChange(function (value) {
                    spotLight.shadowDarkness = value;
                    spotLight.shadowCamera.updateProjectionMatrix();
                });
                datGUI.close();


                light = new THREE.AmbientLight(0x222222);
                scene.add(light);
                light = new THREE.HemisphereLight(0x222222);
                light.intensity = 0.5;
                scene.add(light);

                
                var renderer = new THREE.WebGLRenderer({ antialias: true });
                renderer.setSize(container.offsetWidth, container.offsetHeight);
                renderer.setPixelRatio(window.devicePixelRatio);
                renderer.shadowMapEnabled = true;
                renderer.shadowMapType = THREE.PCFSoftShadowMap;
                renderer.shadowMapDarkness = 0.5;
                renderer.shadowMapSoft = true;

             
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
                        dae.traverse(function (child) {
                            if (child instanceof THREE.Mesh) {
                                 child.castShadow = true;
                                 child.receiveShadow = true;
                                 child.alphaTest = 0.5;
                                 console.log(child);
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
