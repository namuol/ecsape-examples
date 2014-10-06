var ECS = require('ecsape'),
    color = require('color'),
    inherits = require('util').inherits,
    MotionSystem,
    GravitySystem,
    CollisionSystem,
    RenderSystem,
    Position,
    Velocity,
    Circle,
    Color,
    world = new ECS.World(),
    canvas = document.getElementById('canvas'),
    ball,
    dt,
    i;

// Position Component ///////

Position = function (pos) {
  Position.super_.call(this);
  this.x = pos.x;
  this.y = pos.y;
}

inherits(Position, ECS.Component);

Position.prototype.name = 'position';


// Circle Component ///////

Circle = function (radius) {
  Circle.super_.call(this);
  this.radius = radius;
}

inherits(Circle, ECS.Component);

Circle.prototype.name = 'circle';


// Color Component ///////

Color = function (string) {
  Color.super_.call(this);
  this.string = string;
}

inherits(Color, ECS.Component);

Color.prototype.name = 'color';


// Velocity Component ///////

Velocity = function (vel) {
  Velocity.super_.call(this);
  this.x = vel.x;
  this.y = vel.y;
}

inherits(Velocity, ECS.Component);

Velocity.prototype.name = 'velocity';


// Gravity System ///////

GravitySystem = function (gravity) {
  GravitySystem.super_.call(this);
  this.x = gravity.x;
  this.y = gravity.y;
};

inherits(GravitySystem, ECS.System);

GravitySystem.prototype.init = function (world) {
  GravitySystem.super_.call(this);
  this.world = world;
  this.entities = world.get('velocity');
}

GravitySystem.prototype.update = function (dt) {
  GravitySystem.super_.call(this);
  var x = this.x,
      y = this.y;
  this.entities.each(function (entity) {
    entity.velocity.x += x;
    entity.velocity.y += y;
  });
}


// Motion System ////////

MotionSystem = function () {
  MotionSystem.super_.call(this);
};

inherits(MotionSystem, ECS.System);

MotionSystem.prototype.init = function (world) {
  MotionSystem.super_.call(this);
  this.world = world;
  this.entities = world.get('position', 'velocity');
}

MotionSystem.prototype.update = function (dt) {
  MotionSystem.super_.call(this);
  this.entities.each(function (entity) {
    entity.position.x += entity.velocity.x;
    entity.position.y += entity.velocity.y;
  });
}


// Collision System //////

CollisionSystem = function (width, height) {
  CollisionSystem.super_.call(this);
  this.width = width;
  this.height = height;
}

inherits(CollisionSystem, ECS.System);

CollisionSystem.prototype.init = function (world) {
  CollisionSystem.super_.call(this);
  this.world = world;
  this.entities = world.get('position', 'velocity', 'circle');
}

CollisionSystem.prototype.update = function (dt) {
  CollisionSystem.super_.call(this);
  
  var width = this.width,
      height = this.height;

  this.entities.each(function (entity) {
    if (entity.position.x + entity.circle.radius > width) {
      entity.position.x = width - entity.circle.radius;
      entity.velocity.x *= -1;
    } else if (entity.position.x - entity.circle.radius < 0) {
      entity.position.x = entity.circle.radius;
      entity.velocity.x *= -1;
    }

    if (entity.position.y + entity.circle.radius > height) {
      entity.position.y = height - entity.circle.radius;
      entity.velocity.y *= -1;
    } else if (entity.position.y - entity.circle.radius < 0) {
      entity.position.y = entity.circle.radius;
      entity.velocity.y *= -1;
    }
  });
}


// Render System ///////

RenderSystem = function (canvas) {
  RenderSystem.super_.call(this);
  this.canvas = canvas;
  this.context = canvas.getContext('2d');
};

inherits(RenderSystem, ECS.System);

RenderSystem.prototype.init = function (world) {
  RenderSystem.super_.call(this);
  this.world = world
  this.entities = world.get('position', 'circle', 'color');
}

RenderSystem.prototype.render = function () {
  RenderSystem.super_.call(this);
  this.context.fillStyle = 'black';
  this.context.fillRect(0,0, this.canvas.width, this.canvas.height);
  var context = this.context;
  this.entities.each(function (entity) {
    context.fillStyle = entity.color.string;
    context.beginPath();
    context.arc(entity.position.x, entity.position.y, entity.circle.radius, 0, Math.PI*2, true);
    context.closePath();
    context.fill();
  });
}


// Add some entities
for (i = 0; i < 20; i += 1) {
  ball = world.add(new ECS.Entity());
  
  // Add components to the entity
  ball.addComponent(new Position({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height
  }));

  ball.addComponent(new Velocity({
    x: 10 * (-1 + 2*(Math.random())),
    y: 10 * (-1 + 2*(Math.random()))
  }));

  ball.addComponent(new Circle(10 + Math.random() * 20));
  ball.addComponent(new Color( color('#fa4').rotate(Math.random()*180).hexString() ));
}

world.addSystem(new GravitySystem({
  x: 0,
  y: 0.25
}));

world.addSystem(new MotionSystem());

world.addSystem(new CollisionSystem(canvas.width, canvas.height));

world.addSystem(new RenderSystem(canvas));

window.world = world;

function animate() {
  world.flush();
  world.invoke('update', 1/60);
  world.invoke('render');

  window.requestAnimationFrame(animate);
}

animate();