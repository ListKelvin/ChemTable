/*
	Copyright 2022 Michael Dayah - All Rights Reserved.
	Ptable® is a registered trademark of Michael Dayah
	Electronic redistribution in any form is strictly prohibited.

	Learn from this clean, library-free, framework-free code,
	but use what you learn to create something original.
*/
const t = t=>document.getElementById(t);
let e, n, r, o = 0;
const i = 2 * Math.PI
  , a = -Math.PI / 5
  , s = i / 4 + i / 8
  , l = 8
  , c = "\n\tprecision highp float;\n\tuniform float uMode;\n\tuniform vec3 uRot;\n\tuniform vec3 uPositiveColor;\n\tuniform vec3 uNegativeColor;\n\tuniform vec3 uNodeColor;\n\tuniform float uNodes;\n\tuniform float uScale;\n\tuniform float uIso;\n\tuniform float uSlice;\n\tuniform float uDensity;\n\tuniform float uLight;\n\tuniform float uVisible;\n\tvarying highp vec3 vPos;\n\tvarying highp vec3 vRayPos;\n\tvarying highp vec3 vRayDir;\n\tvarying highp vec3 vLight1DirObject;\n\tvarying highp vec3 vLight1DirWorld;\n\tvarying highp vec3 vLight2DirObject;\n\tvarying highp vec3 vLight2DirWorld;\n\tvarying highp vec3 vSliceDir;\n\tvarying highp float vFragX;\n\tvarying highp float vFragZ;\n\tconst int NUM_SAMPLES = 40;\n\tconst float AMBIENT = 0.3;\n\tconst float LIGHT_1_INTENSITY = 0.9;\n\tconst float LIGHT_2_INTENSITY = 0.1;\n\tconst float GRADIENT_DISTANCE = 0.001;\n\tconst float PI = 3.14159265;\n\tfloat eval(vec3 pos) {\n\t\tfloat r = length(pos);\n\t\tfloat recR = 1.0 / r;\n\t\tfloat cosine = pos.y * recR;\n\t\tfloat sine = length(pos.xz) * recR;\n\t\tfloat cosx = pos.x * recR;\n\t\t@formula;\n\t\treturn w;\n\t}\n\tfloat eval_and_square(vec3 pos) {\n\t\tfloat t = eval(pos);\n\t\treturn t * t;\n\t}\n\tvec3 eval_color(vec3 pos) {\n\t\tfloat density = eval(pos);\n\t\treturn (density > 0.0) ? uPositiveColor : uNegativeColor;\n\t}\n\tvec3 derivative(vec3 pos) {\n\t\tfloat f0 = eval(pos);\n\t\treturn normalize(vec3(\n\t\t\t(eval(pos + vec3(GRADIENT_DISTANCE, 0.0, 0.0)) - f0) / GRADIENT_DISTANCE,\n\t\t\t(eval(pos + vec3(0.0, GRADIENT_DISTANCE, 0.0)) - f0) / GRADIENT_DISTANCE,\n\t\t\t(eval(pos + vec3(0.0, 0.0, GRADIENT_DISTANCE)) - f0) / GRADIENT_DISTANCE\n\t\t));\n\t}\n\tfloat light(vec3 normal, vec3 light1Dir, vec3 light2Dir) {\n\t\tfloat diffuse1 = max(dot(normal, light1Dir), 0.0) * LIGHT_1_INTENSITY;\n\t\tfloat diffuse2 = max(dot(normal, light2Dir), 0.0) * LIGHT_2_INTENSITY;\n\t\treturn diffuse1 + diffuse2 + AMBIENT;\n\t}\n\tfloat slice_alpha(float slice, vec3 rayPos, vec3 rayDir) {\n\t\treturn (1.0 - slice) + (1.0 - dot(\n\t\t\tnormalize(vec3(rayPos.x, 0.0, rayPos.z)),\n\t\t -normalize(vec3(rayDir.x, 0.0, rayDir.z))\n\t\t));\n\t}\n\tvec3 refine(vec3 rayPos, vec3 rayDir, vec3 rayStep, float prev, float target, float mode) {\n\t\tfloat current;\n\t\trayStep = -rayStep * 0.5;\n\t\tfor(int r=0; r<4; r++) {\n\t\t\trayPos = rayPos + rayStep;\n\t\t\tif(mode < 1.0) {\n\t\t\t\tcurrent = slice_alpha(uSlice, rayPos, rayDir);\n\t\t\t} else if(mode < 2.0) {\n\t\t\t\tcurrent = eval(rayPos);\n\t\t\t} else {\n\t\t\t\tcurrent = eval_and_square(rayPos);\n\t\t\t}\n\t\t\trayStep *= 0.5;\n\t\t\tif((prev < target && current > target) ||\n\t\t\t\t (prev > target && current < target)) {\n\t\t\t\trayStep = -rayStep;\n\t\t\t}\n\t\t\tprev = current;\n\t\t}\n\t\treturn rayPos;\n\t}\n\tvoid main() {\n\t\tfloat stepSize = 1.0 / float(NUM_SAMPLES);\n\t\tvec3 rayPos = vRayPos;\n\t\tvec3 rayDir = normalize(vRayDir);\n\t\tvec3 rayStep =\trayDir * stepSize * 60.0;\n\t\tfloat viewZ = 1.0;\n\t\tfloat viewZStep = -(2.0 / float(NUM_SAMPLES));\n\t\tfloat densitySq = 0.0;\n\t\tfloat densitySqPrev = 0.0;\n\t\tfloat density = 0.0;\n\t\tfloat densityPrev = 0.0;\n\t\tvec3 inScatter = vec3(0.0);\n\t\tfloat transmittance = 1.0;\n\t\tfloat sliceAlpha = 0.0;\n\t\tfloat sliceAlphaPrev = 1.0;\n\t\tfor(int s=0; s<NUM_SAMPLES; s++) {\n\t\t\tdensity = eval(rayPos);\n\t\t\tdensitySq = density * density;\n\t\t\t// Nodes\n\t\t\tif((densityPrev < 0.0 && density > 0.0) ||\n\t\t\t\t(densityPrev > 0.0 && density < 0.0)) {\n\t\t\t\trayPos = refine(rayPos, rayDir, rayStep, density, 0.0, 1.0);\n\t\t\t\tif(length(rayPos) < 32.0) {\n\t\t\t\t\tvec3 normal = derivative(rayPos);\n\t\t\t\t\tfloat fresnel = (1.0-min(pow(abs(dot(normal, -vRayDir)), 3.0), 1.0));\n\t\t\t\t\tinScatter += uNodeColor * uNodes * fresnel * transmittance;\n\t\t\t\t\ttransmittance *= 1.0 - uNodes * fresnel;\n\t\t\t\t}\n\t\t\t}\n\t\t\t// Axes\n\t\t\tif(uMode > 0.0) {\n\t\t\t\tif(viewZ < vFragZ * uScale + 0.1) {\n\t\t\t\t\tinScatter += vec3((1.0 - uLight)) * transmittance;\n\t\t\t\t\ttransmittance = 0.1;\n\t\t\t\t\tbreak;\n\t\t\t\t}\n\t\t\t}\n\t\t\tvec3 color = eval_color(rayPos);\n\t\t\tsliceAlpha = uSlice > 0.0?slice_alpha(uSlice, rayPos, rayDir) : 1.0;\n\t\t\tif(sliceAlpha >= 1.0) {\n\t\t\t\t// Slice\n\t\t\t\tif(sliceAlphaPrev < 1.0) {\n\t\t\t\t\trayPos = refine(rayPos, rayDir, rayStep, sliceAlpha, 1.0, 0.0);\n\t\t\t\t\tdensitySq = eval_and_square(rayPos);\n\t\t\t\t\tif(densitySq > uIso) {\n\t\t\t\t\t\tvec3 normal = vec3(sin(uSlice * PI), 0.0, cos(uSlice * PI));\n\t\t\t\t\t\tif(vFragX < 0.0) normal.x = -normal.x;\n\t\t\t\t\t\tvec3 sliceLit = color * light(normal, vLight1DirWorld, vLight2DirWorld);\n\t\t\t\t\t\tinScatter += sliceLit * transmittance;\n\t\t\t\t\t\ttransmittance = 0.0;\n\t\t\t\t\t\tbreak;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\t// ISO Surface\n\t\t\t\tif(densitySq > uIso && densitySqPrev < uIso) {\n\t\t\t\t\trayPos = refine(rayPos, rayDir, rayStep, densitySq, uIso, 2.0);\n\t\t\t\t\tvec3 normal = derivative(rayPos);\n\t\t\t\t\tif(density < 0.0) normal = -normal;\n\t\t\t\t\tvec3 isoLit = color * light(normal, vLight1DirObject, vLight2DirObject);\n\t\t\t\t\tinScatter += isoLit * transmittance;\n\t\t\t\t\ttransmittance = 0.0;\n\t\t\t\t\tbreak;\n\t\t\t\t}\n\t\t\t}\n\t\t\t// Density Plot\n\t\t\tif(uDensity > 0.0) {\n\t\t\t\tfloat dist = stepSize * 60.0;\n\t\t\t\tfloat d = min(densitySq * 300.0, 1.0) * uDensity;\n\t\t\t\ttransmittance *= exp(-d * dist);\n\t\t\t\tinScatter += color * d * transmittance * dist;\n\t\t\t}\n\t\t\tif(transmittance < 0.01) break;\n\t\t\tdensityPrev = density;\n\t\t\tdensitySqPrev = densitySq;\n\t\t\tsliceAlphaPrev = sliceAlpha;\n\t\t\trayPos += rayStep;\n\t\t\tviewZ += viewZStep;\n\t\t}\n\t\tfloat finalAlpha = 1.0 - transmittance;\n\t\tgl_FragColor = vec4(inScatter * uVisible, finalAlpha * uVisible);\n\t}\n";
function u(t, e) {
    const r = n.createShader(t);
    return n.isContextLost() ? null : (n.shaderSource(r, e),
    n.compileShader(r),
    n.getShaderParameter(r, n.COMPILE_STATUS) ? r : (reportError(n.getShaderInfoLog(r)),
    n.deleteShader(r),
    null))
}
function f(t) {
    let e = t.toString();
    return -1 === e.indexOf(".") ? e + ".0" : e
}
function v(t) {
    let e = 1;
    for (let n = t; n > 0; n--)
        e *= n;
    return e
}
function m(t) {
    return {
        v: t,
        a: e=>{
            let n = []
              , r = e.v;
            for (let e = Math.max(t.length, r.length); e--; )
                n[e] = (t[e] || 0) + (r[e] || 0);
            return m(n)
        }
        ,
        sub: e=>{
            let n = []
              , r = e.v;
            for (let e = Math.max(t.length, r.length); e--; )
                n[e] = (t[e] || 0) - (r[e] || 0);
            return m(n)
        }
        ,
        m: e=>{
            let n = []
              , r = e.v;
            for (let e = t.length; e--; )
                for (let o = r.length; o--; )
                    n[e + o] = (n[e + o] || 0) + t[e] * r[o];
            return m(n)
        }
        ,
        s: e=>{
            let n = [];
            for (let r = t.length; r--; )
                n[r] = e * t[r];
            return m(n)
        }
        ,
        dx: ()=>{
            let e = [];
            for (let n = t.length; n-- > 0; )
                e[n - 1] = n * t[n];
            return m(e)
        }
        ,
        fx: e=>{
            let n = t.length
              , r = "";
            switch (n) {
            case 0:
                return "0.0";
            case 1:
                return f(t[0]);
            default:
                for (let t = n - 2; t--; )
                    r += "(";
                r += f(t[n - 1]) + "*" + e,
                0 !== t[n - 2] && (r += "+" + f(t[n - 2]));
                for (let o = n - 2; o--; )
                    r += ")*" + e,
                    0 !== t[o] && (r += "+" + f(t[o]));
                return r
            }
        }
    }
}
const h = [];
function g(t) {
    switch (t) {
    case 0:
        return m([1]);
    case 1:
        return m([0, 1]);
    default:
        return m([0, 2]).m(g(t - 1)).sub(g(t - 2))
    }
}
function y({l: t, m: e, n}) {
    const r = function(t, e) {
        let n = m([0])
          , r = m([1]);
        for (let o = 1; o <= t; ++o) {
            const t = n;
            n = r;
            const i = m([2 * o - 1 + e, -1]).m(n)
              , a = m([-(o - 1 + e)]).m(t);
            r = i.a(a).s(1 / o)
        }
        return r
    }(n - t - 1, 2 * t + 1);
    let o = function(t) {
        const e = t=>{
            if (h[t])
                return h[t];
            switch (t) {
            case 0:
                return m([1]);
            case 1:
                return m([0, 1]);
            default:
                {
                    const n = t - 1
                      , r = m([0, 2 * n + 1]).m(e(n));
                    return e(t - 2).s(-n).a(r).s(1 / t)
                }
            }
        }
          , n = e(t);
        return h[n] = n,
        n
    }(t);
    const i = e < 0
      , a = Math.abs(e);
    for (let t = a; t--; )
        o = o.dx();
    const s = g(a);
    return `float rho = r;float w = ${`(${r.fx("rho")}) * pow(rho, ${t}.0) * exp(-rho / 2.0)`} * ${`(${o.fx("cosine")}) * pow(sine, ${f(a)})`} * ${`(${s.fx("cosx")})`} * ${f(Math.sqrt((2 * t + 1) / 2 * v(t - a) / v(t + a)) * Math.sqrt(2 / n * (2 / n) * (2 / n) * v(n - t - 1) / (2 * n) / v(n + t)) * (i ? -1 : 1))} * r`
}
function d(t, e, r) {
    r && (t = t.map((t=>t * r)));
    const o = n.createBuffer();
    n.bindBuffer(n.ARRAY_BUFFER, o),
    n.bufferData(n.ARRAY_BUFFER, new Float32Array(t), n.STATIC_DRAW);
    const i = n.createBuffer();
    return n.bindBuffer(n.ELEMENT_ARRAY_BUFFER, i),
    n.bufferData(n.ELEMENT_ARRAY_BUFFER, new Uint16Array(e), n.STATIC_DRAW),
    {
        vertexBuffer: o,
        indexBuffer: i,
        numIndicies: e.length
    }
}
function p(t, e, r) {
    n.bindBuffer(n.ARRAY_BUFFER, t.vertexBuffer),
    n.bindBuffer(n.ELEMENT_ARRAY_BUFFER, t.indexBuffer),
    n.enableVertexAttribArray(e.attributes.aPos),
    n.vertexAttribPointer(e.attributes.aPos, 3, n.FLOAT, !1, 0, 0),
    n.drawElements(r, t.numIndicies, n.UNSIGNED_SHORT, 0)
}
function S() {
    const {rotation: t, angularVelocity: i, dragging: a, paused: s, previousTime: l, capable: c} = e;
    n.clearColor(0, 0, 0, 0),
    n.clear(n.COLOR_BUFFER_BIT | n.DEPTH_BUFFER_BIT);
    const u = performance.now()
      , f = u - r;
    if (f > 500 && o++,
    !e.visible && f > 1e3) {
        const t = f / o;
        console.log("Orbital average frame time (ms): ", t),
        t <= 50 && (i.yaw = 4.73,
        e.capable = !0),
        e.visible = !0
    }
    const v = u && l ? (u - l) / 1e3 : 0;
    e.previousTime = u,
    n.clearColor(0, 0, 0, 0),
    n.clear(n.COLOR_BUFFER_BIT | n.DEPTH_BUFFER_BIT),
    e.rotation = {
        pitch: Math.min(Math.max(t.pitch + i.pitch * v, -1.3), 1.3),
        yaw: t.yaw + i.yaw * v,
        roll: 0
    };
    const m = Math.exp(-(e.capable ? .25 : 3) * v);
    i.yaw *= m,
    i.pitch *= m,
    e.visible && !a && Math.abs(i.yaw) < .15 && Math.abs(i.pitch) < .15 && (e.paused = !0),
    function() {
        const {raymarchGeometry: t, axesGeometry: r, xPlusGeometry: o, yPlusGeometry: i, zPlusGeometry: a, raymarchShader: s, rotation: l, nodes: c, scale: u, iso: f, slice: v, sliceHardness: m, sliceAlpha: h, density: g, positiveColor: y, negativeColor: d, nodeColor: S, light: P, visible: D} = e;
        n.useProgram(s.program),
        n.uniform3f(s.uniforms.uRot, l.pitch, l.yaw, 0),
        n.uniform1f(s.uniforms.uNodes, c),
        n.uniform3f(s.uniforms.uPositiveColor, y.r, y.g, y.b),
        n.uniform3f(s.uniforms.uNegativeColor, d.r, d.g, d.b),
        n.uniform3f(s.uniforms.uNodeColor, S.r, S.g, S.b),
        n.uniform1f(s.uniforms.uScale, u),
        n.uniform1f(s.uniforms.uIso, f),
        n.uniform1f(s.uniforms.uSlice, v),
        n.uniform1f(s.uniforms.uDensity, g),
        n.uniform1f(s.uniforms.uLight, P ? 1 : 0),
        n.uniform1f(s.uniforms.uVisible, D ? 1 : 0),
        n.uniform1f(s.uniforms.uMode, 0),
        n.disable(n.DEPTH_TEST),
        n.disable(n.CULL_FACE),
        n.depthMask(!1),
        n.disable(n.BLEND),
        p(t, s, n.TRIANGLES),
        n.uniform1f(s.uniforms.uMode, 1),
        n.enable(n.BLEND),
        n.blendFunc(n.SRC_ALPHA, n.ONE_MINUS_SRC_ALPHA),
        p(r, s, n.LINES),
        n.uniform1f(s.uniforms.uMode, 2),
        n.uniform3f(s.uniforms.uOffset, .95, 0, 0),
        p(o, s, n.TRIANGLES),
        n.uniform3f(s.uniforms.uOffset, 0, 0, .95),
        p(i, s, n.TRIANGLES),
        n.uniform3f(s.uniforms.uOffset, 0, .95, 0),
        p(a, s, n.TRIANGLES)
    }(),
    s || requestAnimationFrame(S)
}
function P(r) {
    let o = 1e-4
      , i = 0
      , a = 1
      , s = .24
      , l = .1;
    0 === r.m ? (r.l + 1 !== r.n && (i = .3),
    a = 200,
    s = .04,
    l = .025) : 2 === r.l && 2 === Math.abs(r.m) && (o = 4e-4),
    e.iso = o,
    e.slice = i,
    e.sliceHardness = a,
    e.sliceAlpha = s,
    e.density = l;
    const f = y(r);
    e.raymarchShader = function(t) {
        const e = u(n.VERTEX_SHADER, "\n\tprecision highp float;\n\tattribute vec3 aPos;\n\tuniform float uMode;\n\tuniform vec3 uRot;\n\tuniform float uScale;\n\tuniform vec3 uOffset;\n\tvarying highp vec3 vPos;\n\tvarying highp vec3 vRayPos;\n\tvarying highp vec3 vRayDir;\n\tvarying highp vec3 vLight1DirObject;\n\tvarying highp vec3 vLight1DirWorld;\n\tvarying highp vec3 vLight2DirObject;\n\tvarying highp vec3 vLight2DirWorld;\n\tvarying highp vec3 vSliceDir;\n\tvarying highp float vFragX;\n\tvarying highp float vFragZ;\n\tconst vec3 LIGHT_1_DIR = normalize(vec3(0.393, 0.193, 0.862));\n\tconst vec3 LIGHT_2_DIR = normalize(vec3(-0.433, -0.433, 0.216));\n\tmat4 rotation_pitch(float radians) {\n\t\treturn mat4(1, 0, 0, 0, 0, cos(radians), -sin(radians), 0, 0, sin(radians), cos(radians), 0, 0, 0, 0, 1);\n\t}\n\tmat4 rotation_yaw(float radians) {\n\t\treturn mat4(cos(radians), 0, sin(radians), 0, 0, 1, 0, 0, -sin(radians), 0, cos(radians), 0, 0, 0, 0, 1);\n\t}\n\tvoid main() {\n\t\tmat4 mat = rotation_yaw(uRot.y) * rotation_pitch(uRot.x);\n\t\tmat4 invMat = rotation_yaw(-uRot.y) * rotation_pitch(-uRot.x);\n\t\tvec4 viewPos;\n\t\tif(uMode < 1.0) {\n\t\t\tviewPos = vec4(aPos, 1.0);\n\t\t} else if(uMode < 2.0) {\n\t\t\tviewPos = (vec4(aPos, 1.0) * invMat);\n\t\t} else {\n\t\t\tviewPos = (vec4(aPos, 1.0) + vec4(uOffset, 0.0) * mat);\n\t\t}\n\t\tvPos = aPos;\n\t\tvRayPos = ((mat * vec4(viewPos.xy * (1.0 / uScale), -0.5, 1.0)).xyz * 60.0);\n\t\tvRayDir = ((mat * vec4(0.0, 0.0, 1.0, 1.0)).xyz);\n\t\tvLight1DirWorld = LIGHT_1_DIR;\n\t\tvLight2DirWorld = LIGHT_2_DIR;\n\t\tvLight1DirObject = (mat * vec4(LIGHT_1_DIR, 1.0)).xyz;\n\t\tvLight2DirObject = (mat * vec4(LIGHT_2_DIR, 1.0)).xyz;\n\t\tvSliceDir = (mat * vec4(0.0, 0.0, 1.0, 1.0)).xyz;\n\t\tvFragX = viewPos.x;\n\t\tvFragZ = (uMode > 1.0) ? -viewPos.z : viewPos.z;\n\t\tgl_Position = viewPos;\n\t}\n");
        if (!e)
            return null;
        const r = c.replace(/\@formula/gm, t)
          , o = u(n.FRAGMENT_SHADER, r);
        if (!o)
            return null;
        const i = n.createProgram();
        return n.attachShader(i, e),
        n.attachShader(i, o),
        n.linkProgram(i),
        n.getProgramParameter(i, n.LINK_STATUS) ? {
            program: i,
            attributes: {
                aPos: n.getAttribLocation(i, "aPos")
            },
            uniforms: {
                uMode: n.getUniformLocation(i, "uMode"),
                uRot: n.getUniformLocation(i, "uRot"),
                uPositiveColor: n.getUniformLocation(i, "uPositiveColor"),
                uNegativeColor: n.getUniformLocation(i, "uNegativeColor"),
                uNodeColor: n.getUniformLocation(i, "uNodeColor"),
                uNodes: n.getUniformLocation(i, "uNodes"),
                uScale: n.getUniformLocation(i, "uScale"),
                uIso: n.getUniformLocation(i, "uIso"),
                uSlice: n.getUniformLocation(i, "uSlice"),
                uDensity: n.getUniformLocation(i, "uDensity"),
                uOffset: n.getUniformLocation(i, "uOffset"),
                uLight: n.getUniformLocation(i, "uLight"),
                uVisible: n.getUniformLocation(i, "uVisible")
            }
        } : null
    }(f),
    t("orbital_lmn").textContent = `\u{1d459} = ${r.l}\n\u{1d45a} = ${r.m}\n\u{1d45b} = ${r.n}`
}
function D() {
    return e
}
window.addEventListener("drawOrbital", (o=>{
    const i = Object.assign({}, o.detail)
      , c = !t("DarkButton").checked;
    if (e)
        i.l === e.lmn.l && i.m === e.lmn.m && i.n === e.lmn.n || P(i),
        e.light = c,
        e.paused && S();
    else {
        const o = t("Orbital");
        if (function(t) {
            const e = {
                depth: !0,
                antialias: !0,
                alpha: !0,
                stencil: !1,
                preserveDrawingBuffer: !1
            };
            if (n = t.getContext("webgl2", e),
            !n && (n = t.getContext("webgl", e),
            !n))
                ;
        }(o),
        !n)
            return null;
        e = {
            gl: n,
            nodes: .3,
            scale: 1.3,
            capable: !1,
            visible: !1,
            paused: !1,
            rotation: {
                pitch: a,
                yaw: s
            },
            angularVelocity: {
                pitch: 0,
                yaw: 0
            },
            positiveColor: {
                r: 1,
                g: 0,
                b: 0
            },
            negativeColor: {
                r: 0,
                g: 0,
                b: 1
            },
            nodeColor: {
                r: .5,
                g: .5,
                b: .5
            },
            previousTime: 0
        },
        e.raymarchGeometry = d([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], [0, 1, 2, 2, 3, 0]);
        const u = .2
          , f = .85;
        e.axesGeometry = d([u, 0, 0, f, 0, 0, 0, u, 0, 0, f, 0, 0, 0, -u, 0, 0, -f], [0, 1, 2, 3, 4, 5]);
        const v = [-71, 47, 0, -58, 47, 0, -58, 7, 0, -18, 7, 0, -18, -6, 0, -58, -6, 0, -58, -45, 0, -71, -45, 0, -71, -6, 0, -110, -6, 0, -110, 7, 0, -71, 7, 0]
          , m = [0, 1, 2, 2, 3, 4, 2, 4, 5, 8, 5, 6, 8, 6, 7, 10, 8, 9, 10, 11, 8, 0, 2, 11, 11, 2, 5, 11, 5, 8]
          , h = [2, 69, 0, 23, 69, 0, 56, 11, 0, 92, 69, 0, 111, 69, 0, 67, 0, 0, 111, -71, 0, 91, -71, 0, 56, -10, 0, 18, -71, 0, -1, -71, 0, 46, 0, 0]
          , g = [0, 1, 2, 0, 2, 11, 3, 4, 2, 4, 5, 2, 5, 6, 8, 8, 6, 7, 2, 5, 8, 2, 8, 11, 11, 8, 10, 8, 9, 10]
          , y = [2, 70, 0, 20, 70, 0, 55, -2, 0, 92, 70, 0, 109, 70, 0, 63, -18, 0, 63, -70, 0, 47, -70, 0, 47, -18, 0]
          , p = [0, 1, 2, 2, 3, 4, 2, 4, 5, 0, 2, 8, 8, 2, 5, 5, 6, 7, 8, 5, 7]
          , D = [3, 70, 0, 103, 70, 0, 103, 66, 0, 21, -56, 0, 101, -56, 0, 101, -70, 0, -4, -70, 0, -4, -66, 0, 77, 54, 0, 3, 54, 0]
          , _ = [0, 1, 8, 8, 1, 2, 0, 8, 9, 8, 2, 3, 8, 3, 7, 7, 3, 6, 3, 4, 5, 3, 5, 6]
          , L = v.length / 3;
        let I, E, R, A, T, b;
        e.xPlusGeometry = d([...v, ...h], [...m, ...g.map((t=>t + L))], 6e-4),
        e.yPlusGeometry = d([...v, ...y], [...m, ...p.map((t=>t + L))], 6e-4),
        e.zPlusGeometry = d([...v, ...D], [...m, ..._.map((t=>t + L))], 6e-4);
        const N = t=>t.changedTouches ? t.changedTouches[0].clientX : t.clientX
          , x = t=>t.changedTouches ? t.changedTouches[0].clientY : t.clientY
          , w = t=>{
            t.preventDefault();
            const n = N(t)
              , r = x(t);
            var o;
            A && (T = {
                x: n - A.x,
                y: r - A.y
            }),
            o = b,
            clearTimeout(o),
            o = setTimeout((()=>T = {
                x: 0,
                y: 0
            }), 200),
            A = {
                x: n,
                y: r
            },
            e.rotation = {
                pitch: R.pitch + (E - r) / 100,
                yaw: R.yaw + (I - n) / 100
            }
        }
          , M = ()=>{
            (Math.abs(T.x) > 5 || Math.abs(T.y) > 5) && (e.angularVelocity.yaw = Math.max(Math.min(1 * -T.x, l), -l)),
            document.removeEventListener("pointermove", w),
            document.removeEventListener("pointerup", M),
            e.dragging = !1
        }
          , C = t=>{
            document.addEventListener("pointermove", w),
            document.addEventListener("pointerup", M),
            I = N(t),
            E = x(t),
            R = e.rotation,
            e.angularVelocity = {
                pitch: 0,
                yaw: 0,
                roll: 0
            },
            e.dragging = !0,
            A = null,
            T = {
                x: 0,
                y: 0
            },
            e.paused && (e.paused = !1,
            S())
        }
        ;
        o.addEventListener("pointerdown", C, !1),
        P(i),
        e.light = c,
        r = performance.now(),
        S()
    }
    e.lmn = i
}
));
export {D as get_orbital};
