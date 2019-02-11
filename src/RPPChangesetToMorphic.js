Morph.prototype.add = function (aMorph) {
  var owner = aMorph.parent;
  if (owner !== null) {
      owner.removeChild(aMorph);
  }
  if (isNil(aMorph.morphId)) {
    var world = this.root();
    aMorph.morphId = world.nextMorphId();
  }
  this.addChild(aMorph);
};

WorldMorph.prototype.init = function (aCanvas, fillPage) {
    WorldMorph.uber.init.call(this);
    this.color = new Color(205, 205, 205); // (130, 130, 130)
    this.alpha = 1;
    this.bounds = new Rectangle(0, 0, aCanvas.width, aCanvas.height);
    this.drawNew();
    this.isVisible = true;
    this.isDraggable = false;
    this.currentKey = null; // currently pressed key code
    this.worldCanvas = aCanvas;
    this.noticesTransparentClick = true;

    // additional properties:
    this.stamp = Date.now(); // reference in multi-world setups
    while (this.stamp === Date.now()) {nop(); }
    this.stamp = Date.now();

    this.useFillPage = fillPage;
    if (this.useFillPage === undefined) {
        this.useFillPage = true;
    }
    this.isDevMode = false;
    this.broken = [];
    this.animations = [];
    this.hand = new HandMorph(this);
    this.keyboardReceiver = null;
    this.cursor = null;
    this.lastEditedText = null;
    this.activeMenu = null;
    this.activeHandle = null;
    this.virtualKeyboard = null;
    
    this.morphId = 0;
    this.initEventListeners();
};

WorldMorph.prototype.nextMorphId = function () {
  this.morphId++;
  return this.morphId;
}
WorldMorph.prototype.initEventListeners = function () {
  var canvas = this.worldCanvas, myself = this;

  if (myself.useFillPage) {
      myself.fillPage();
  } else {
      this.changed();
  }

  canvas.addEventListener(
      "mousedown",
      function (event) {
          event.preventDefault();
          canvas.focus();
          myself.hand.processMouseDown(event);
      },
      false
  );

  canvas.addEventListener(
      "touchstart",
      function (event) {
          myself.hand.processTouchStart(event);
      },
      false
  );

  canvas.addEventListener(
      "mouseup",
      function (event) {
          event.preventDefault();
          myself.hand.processMouseUp(event);
      },
      false
  );

  canvas.addEventListener(
      "dblclick",
      function (event) {
          event.preventDefault();
          myself.hand.processDoubleClick(event);
      },
      false
  );

  canvas.addEventListener(
      "touchend",
      function (event) {
          myself.hand.processTouchEnd(event);
      },
      false
  );

  canvas.addEventListener(
      "mousemove",
      function (event) {
          myself.hand.processMouseMove(event);
      },
      false
  );

  canvas.addEventListener(
      "touchmove",
      function (event) {
          myself.hand.processTouchMove(event);
      },
      false
  );

  canvas.addEventListener(
      "contextmenu",
      function (event) {
          // suppress context menu for Mac-Firefox
          event.preventDefault();
      },
      false
  );

  canvas.addEventListener(
      "keydown",
      function (event) {
          // remember the keyCode in the world's currentKey property
          myself.currentKey = event.keyCode;
          if (myself.keyboardReceiver) {
              myself.keyboardReceiver.processKeyDown(event);
          }
          // supress backspace override
          if (event.keyCode === 8) {
              event.preventDefault();
          }
          // supress tab override and make sure tab gets
          // received by all browsers
          if (event.keyCode === 9) {
              if (myself.keyboardReceiver) {
                  myself.keyboardReceiver.processKeyPress(event);
              }
              event.preventDefault();
          }
          if ((event.ctrlKey && (!event.altKey) || event.metaKey) &&
                  (event.keyCode !== 86)) { // allow pasting-in
              event.preventDefault();
          }
      },
      false
  );

  canvas.addEventListener(
      "keyup",
      function (event) {
          // flush the world's currentKey property
          myself.currentKey = null;
          // dispatch to keyboard receiver
          if (myself.keyboardReceiver) {
              if (myself.keyboardReceiver.processKeyUp) {
                  myself.keyboardReceiver.processKeyUp(event);
              }
          }
          event.preventDefault();
      },
      false
  );

  canvas.addEventListener(
      "keypress",
      function (event) {
          if (myself.keyboardReceiver) {
              myself.keyboardReceiver.processKeyPress(event);
          }
          event.preventDefault();
      },
      false
  );

  canvas.addEventListener( // Safari, Chrome
      "mousewheel",
      function (event) {
          myself.hand.processMouseScroll(event);
          event.preventDefault();
      },
      false
  );
  canvas.addEventListener( // Firefox
      "DOMMouseScroll",
      function (event) {
          myself.hand.processMouseScroll(event);
          event.preventDefault();
      },
      false
  );

  document.body.addEventListener(
      "paste",
      function (event) {
          var txt = event.clipboardData.getData("Text");
          if (txt && myself.cursor) {
              myself.cursor.insert(txt);
          }
      },
      false
  );

  window.addEventListener(
      "dragover",
      function (event) {
          event.preventDefault();
      },
      false
  );
  window.addEventListener(
      "drop",
      function (event) {
          myself.hand.processDrop(event);
          event.preventDefault();
      },
      false
  );

  window.addEventListener(
      "resize",
      function () {
          if (myself.useFillPage) {
              myself.fillPage();
          }
      },
      false
  );

  window.onbeforeunload = function (evt) {
      var e = evt || window.event,
          msg = "Are you sure you want to leave?";
      // For IE and Firefox
      if (e) {
          e.returnValue = msg;
      }
      // For Safari / chrome
      return msg;
  };
};
