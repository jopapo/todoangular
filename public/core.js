// public/core.js
var scotchTodo = angular.module('scotchTodo', []);

scotchTodo.controller('mainController', function($scope, $http) {
    $scope.formData = {};

	//Sistema de recepção de broadcast
	$scope.socket = io.connect();
	$scope.socket.on('delete', function (id) {
		delete $scope.todos[id];
		$scope.$apply();
	});
	$scope.socket.on('put', function (data) {
		$scope.todos[data._id] = data;
		$scope.$apply();
	});
	$scope.socket.on('post', function (data) {
		$scope.todos[data._id] = data;
		$scope.$apply();
	});

    // when landing on the page, get all todos and show them
    $http.get('/api/todos')
        .success(function(data) {
			$scope.todos = {};
			for (var index in data) {
				var todo = data[index];
				$scope.todos[todo._id] = todo;
			}
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    // when submitting the add form, send the text to the node API
    $scope.createTodo = function() {
        $http.post('/api/todos', $scope.formData)
            .success(function(data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                //$scope.todos = data;
				//$scope.todos[data._id] = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    // delete a todo after checking it
    $scope.deleteTodo = function(id) {
        $http.delete('/api/todos/' + id)
            .success(function(data) {
				//$scope.todos = data;
				//delete $scope.todos[id];
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
	};
	
	// update a todo after checking it
    $scope.toggleTodo = function(id) {
        $http.put('/api/todos/' + id)
            .success(function(data) {
                //$scope.todos = data;
				//$scope.todos[data._id] = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };
	
	$scope.stopPropagation = function($event) {
		// On recent browsers, only $event.stopPropagation() is needed
		if ($event.stopPropagation) $event.stopPropagation();
		if ($event.preventDefault) $event.preventDefault();
		$event.cancelBubble = true;
		$event.returnValue = false;
	};
	
});

