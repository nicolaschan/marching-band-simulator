const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
	alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

var texture = THREE.ImageUtils.loadTexture('field.png');

var field = new THREE.Mesh(new THREE.PlaneGeometry(100, 50, 1), new THREE.MeshBasicMaterial({
	color: 0x00bb00,
	side: THREE.DoubleSide,
	map: texture
}));
scene.add(field);

camera.position.z = 50;

const num_marchers = 40;
const marchers = [];
for (var i = 0; i < num_marchers; i++) {
	var cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 2), new THREE.MeshPhongMaterial({
		color: 0x0000ff
	}));
	cube.position.z = 1;
	cube.position.x = i;
	marchers.push(cube);
	scene.add(cube);
}

var future_positions = [];
const fix = function() {
	var adjust = {
		x: 0,
		y: 0
	};
	for (var i in future_positions) {
		if (future_positions[i].x - 50 > 0)
			if (Math.abs(adjust.x) < Math.abs(future_positions[i].x - 50))
				adjust.x = future_positions[i].x - 50;
		if (future_positions[i].x + 50 < 0)
			if (Math.abs(adjust.x) < Math.abs(future_positions[i].x + 50))
				adjust.x = future_positions[i].x + 50;
		if (future_positions[i].y - 25 > 0)
			if (Math.abs(adjust.y) < Math.abs(future_positions[i].y - 25))
				adjust.y = future_positions[i].y - 25;
		if (future_positions[i].y + 25 < 0)
			if (Math.abs(adjust.y) < Math.abs(future_positions[i].y + 25))
				adjust.y = future_positions[i].y + 25;
	}
	for (var i in future_positions) {
		future_positions[i].x -= adjust.x;
		future_positions[i].y -= adjust.y;
	}
};

const circle = function(center_x, center_y, radius) {
	for (var i in marchers) {
		var angle = (2 * Math.PI / num_marchers) * i;
		var x = center_x + radius * Math.cos(angle);
		var y = center_y + radius * Math.sin(angle);
		future_positions[i] = {
			x: x,
			y: y
		};
	}
	fix();
};
const block = function(center_x, center_y, spacing, width) {
	if (!width)
		width = Math.ceil(Math.sqrt(num_marchers));
	for (var i in marchers) {
		var x = center_x + (i % width) * spacing;
		var y = center_y + Math.floor(i / width) * spacing;
		future_positions[i] = {
			x: x,
			y: y
		};
	}
	fix();
};
const square = function(center_x, center_y, spacing) {
	const side_length = num_marchers / 4;
	const height = num_marchers / 4 * spacing;
	for (var i in marchers) {
		if (i % 4 == 0)
			future_positions[i] = {
				x: center_x + Math.floor(i / 4) * spacing + 1 - height / 2,
				y: center_y - height / 2
			};
		if (i % 4 == 1)
			future_positions[i] = {
				x: center_x - height / 2,
				y: center_y + Math.floor(i / 4) * spacing + 1 - height / 2
			};
		if (i % 4 == 2)
			future_positions[i] = {
				x: center_x + height - height / 2,
				y: center_y + Math.floor(i / 4) * spacing + 1 - height / 2
			};
		if (i % 4 == 3)
			future_positions[i] = {
				x: center_x + Math.floor(i / 4) * spacing + 1 - height / 2,
				y: center_y + height - height / 2
			};
	}
	fix();
};


const marchersInCorrectPlace = function() {
	for (var i in marchers) {
		if (!(Math.abs(marchers[i].position.x - future_positions[i].x) < 0.5 && Math.abs(marchers[i].position.y - future_positions[i].y) < 0.5))
			return false;
	}
	return true;
};

const go = function() {
	const steps = 40;
	for (var i in marchers) {
		var delta_x = future_positions[i].x - marchers[i].position.x;
		var delta_y = future_positions[i].y - marchers[i].position.y;

		marchers[i].position.x += delta_x / steps;
		marchers[i].position.y += delta_y / steps;
	}
	if (!marchersInCorrectPlace())
		setTimeout(go, 30);
};

block(0, 0, 3);
go();


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
document.body.addEventListener('click', function(event) {
	mouse.x = (event.clientX / renderer.domElement.width) * 2 - 1;
	mouse.y = -(event.clientY / renderer.domElement.height) * 2 + 1;
	raycaster.setFromCamera(mouse, camera);
	var intersects = raycaster.intersectObjects([field]);
	var point = intersects[0].point;

	var random = Math.floor(Math.random() * 3);
	switch (random) {
		case 0:
			circle(point.x, point.y, Math.floor(Math.random() * 10 + 5));
			break;
		case 1:
			block(point.x, point.y, Math.floor(Math.random() * 2 + 2));
			break;
		case 2:
			square(point.x, point.y, Math.floor(Math.random() * 2 + 2));
			break;
	}
	go();
});

for (var i = 0; i < 10; i++) {
	var light = new THREE.PointLight(0xffffff, 1.5, 200);
	light.position.set(0, (i - 5) * 10, 20);
	scene.add(light);
}

const controls = new THREE.OrbitControls(camera, renderer.domElement);

const render = function() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
};
render();

document.body.addEventListener('keydown', function(event) {
	// up - 38, down - 40, left - 37, right - 39
	switch (event.keyCode) {
		case 38:
			cube.position.y++;
			break;
		case 40:
			cube.position.y--;
			break;
		case 37:
			cube.position.x--;
			break;
		case 39:
			cube.position.x++;
			break;
	}
});
