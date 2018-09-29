var WIDTH = 1000,
    HEIGHT = 1000,
    NUM_LINES = 50,
    NUM_POINTS = 50,
    LINE_HEIGHT = WIDTH / NUM_POINTS,
    THRESHOLD = 500,
    INNER_THRESHOLD = 100,
    MEAN = 0,
    STANDARD_DEVIATION = 1,
    G = document.getElementById('graphy'),
    DOT_POINTS = Array.from(range(0, WIDTH, WIDTH / NUM_POINTS));

var cx = 500;
var cy = 500;

function range(start, end, step) {
    var i = start,
        result = [];
    while (i <= end) {
        result.push(i);
        i += step;
    }
    return result;
}

function joyDivision(svgElement) {
    var points = [],
        noiseBackground = [];

    function getPoint(cx, cy, i, y) {
        return function (n) {
            var bg = noiseBackground[i][n / (WIDTH / NUM_POINTS)];
            var xDistFromMouse = (cx - n);
            var dx = xDistFromMouse * 5;
            var yDistFromMouse = (cx - n);
            var dy = yDistFromMouse * 1;
            var distance = Math.sqrt(dx * dx + dy * dy) * 0.5 + 15;
            var randomScale = 10.2;

            // PROOF OF CONCEPT
            //   if (Math.abs(distance) > INNER_THRESHOLD) { 
            //     if (Math.abs(distance) > THRESHOLD) { 
            //       randomScale = 3;
            //     } else {
            //     //   randomScale = 1;
            //     }
            //   } else {
            //       randomScale = 3.5;
            //   }
            var p_height = (bg / distance) * randomScale;

            //   console.log("xDistFromMouse: "+xDistFromMouse+",\tyDistFromMouse: "+yDistFromMouse+ ",\tdistance: " +distance);

            return [n, p_height];
        }
    }

    function getPath(cx, cy, i) {
        var y = (HEIGHT / NUM_LINES) * i,
            heights = DOT_POINTS.map(getPoint(cx, cy, i, y));
        return 'M0,' + (y - heights[0][1]) + ' S' + heights.slice(1).map(function (ps) {
            return ps[0] + ',' + (y - ps[1]).toFixed(5)
        }).join(" ") + ' L' + WIDTH + ',' + HEIGHT + ' 0,' + HEIGHT + ' Z';
    }

    function init() {
        svgElement.innerHTML = `<path class="wave" d="M0,0 L${WIDTH},0 Z" />`;
        updateLineNoise();
    }

    // Calculate Gaussian function (WIP)
    function gaussianFunction(x){

        var a = (1 / (STANDARD_DEVIATION * Math.sqrt(2*Math.PI))) * Math.E;
        var exp = Math.pow((x-MEAN),2) / (2*Math.pow(STANDARD_DEVIATION,2));

        return Math.pow(a,exp);
    }

    function updateLineNoise() {
        noiseBackground = [];

        for (var i = 0; i < NUM_LINES; i++) {
            noiseBackground.push(DOT_POINTS.map(function (e) {
                return (Math.random() - 0.5) * 1500
            }));
            svgElement.innerHTML += '<path id="wave_' + i + '" class="wave" d="' + getPath(500, 500, i) + '" />';
        }
    }

    function draw(cx, cy) {
        for (var i = 0; i < NUM_LINES; i++) {
            document.getElementById("wave_" + i).setAttribute('d', getPath(cx, cy, i));
        }
    }

    init();
    return {
        draw: draw
    }
}

var j = joyDivision(G);

function update(timestamp) {
    j.draw(cx, cy)
    window.requestAnimationFrame(update);
}

// Dom events don't work if you are using this as a
// browser source in OBS...
// document.addEventListener("mousemove", function(e) {
//   cx = (e.x / 1920) * 1000;
//   if (e.x > 1920) cx = 500;
//   cy = (e.y / 1080) * 1000;
//     // console.log(cx + ", " + cy);
//   j.draw(cx, cy);
// })

j.draw(500, 500);

// Use the KeystrokeClient server instead.
function mouseHandler(data) {
    //console.log("mouseHander");
    cx = ((data.x % 1920) / 1920) * 1000;
    cy = (data.y / 1080) * 1000;
    j.draw(cx, cy);
}

KeystrokeClient.onMouseMove = mouseHandler;
