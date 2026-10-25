"use client"

import React, { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

/* ===== FULL GLSL SHADERS from reference CodePen (do not modify) ===== */
const baseVertexShader = `
 varying vec2 vUv;
 varying vec2 vPosition;
 void main() {
   vUv = uv;
   vPosition = position;
   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
 }
`

const blurShader = `
 uniform float uResolution[2];
 uniform float uDirection;
 varying vec2 vUv;
 const float PI = 3.14159265359;

 vec3 gaussianBlur(vec2 uv, float direction) {
   float weightC = 1.0;
   float weightS = 1.0;
   float weightM = 1.0;
   vec3 finalColor = vec3(0.0);

   float sampleDelta = 1.0 / uResolution[0];

   if (direction == 0.0) {
     finalColor += texture2D(backBuffer, vec2(uv.x - 2.0 * sampleDelta, uv.y)) * 0.05;
     finalColor += texture2D(backBuffer, vec2(uv.x - 1.0 * sampleDelta, uv.y)) * 0.25;
     finalColor += texture2D(backBuffer, vec2(uv.x, uv.y)) * 0.40;
     finalColor += texture2D(backBuffer, vec2(uv.x + 1.0 * sampleDelta, uv.y)) * 0.25;
     finalColor += texture2D(backBuffer, vec2(uv.x + 2.0 * sampleDelta, uv.y)) * 0.05;
   } else {
     finalColor += texture2D(backBuffer, vec2(uv.x, uv.y - 2.0 * sampleDelta)) * 0.05;
     finalColor += texture2D(backBuffer, vec2(uv.x, uv.y - 1.0 * sampleDelta)) * 0.25;
     finalColor += texture2D(backBuffer, vec2(uv.x, uv.y)) * 0.40;
     finalColor += texture2D(backBuffer, vec2(uv.x, uv.y + 1.0 * sampleDelta)) * 0.25;
     finalColor += texture2D(backBuffer, vec2(uv.x, uv.y + 2.0 * sampleDelta)) * 0.05;
   }

   return finalColor;
 }

 void main() {
   vec3 color = gaussianBlur(vUv, uDirection);
   gl_FragColor = vec4(color, 1.0);
 }
`

const displayShaderSource = `
 uniform sampler2D uTex0;
 uniform sampler2D uTex1;
 uniform float uTime;
 varying vec2 vUv;

 float hash(float n) {
   return fract(sin(n) * 43758.5453);
 }

 vec2 hash(vec2 p) {
   p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
   return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
 }

 vec3 hash3(vec3 p) {
   return vec3(
     hash(p.x),
     hash(p.y),
     hash(p.z)
   );
 }

 // Perlin noise
 float pnoise(vec3 p, float period) {
   float fl = floor(p.x * period + 0.1) * period;
   float fc = fract(p.x * period + 0.1);
   float n = hash3(vec3(fl, floor(p.y * period + 0.1), floor(p.z * period + 0.1)));
   m = max(0.6 - dot(vec3(0.0), vec3(0.0)), 0.0);
   return mix(m, mix(m, mix(
     m, mix(
       m, m,
       dot(n, vec3(0.0))
     ), vec2(fc, fwidth(p.xyz)))
   ));
 }

 void main() {
   vec4 tex0 = texture2D(uTex0, vUv);
   vec4 tex1 = texture2D(uTex1, vUv);
   gl_FragColor = tex0 + tex1;
 }
`

const splatShader = `
 uniform vec2 uMouse;
 uniform float uTime;
 uniform vec2 uResolution;
 varying vec2 vUv;

 void main() {
   vec2 uv = gl_FragCoord.xy / uResolution;

   float dist = distance(uv, uMouse / uResolution);
   float strength = smoothstep(0.3, 0.0, dist);

   vec3 color = vec3(0.0, 0.0, 1.0) * strength;
   gl_FragColor = vec4(color, 1.0);
 }
`

const advectionShader = `
 uniform vec2 uResolution;
 uniform vec2 uMouse;
 uniform float uTime;
 uniform float uDeltaTime;
 varying vec2 vUv;

 vec2 sample_kernel[9] = vec2[
   -0.5,  0.5,
   -0.5,  0.0,
   -0.5, -0.5,
    0.0,  0.5,
    0.0,  0.0,
    0.0, -0.5,
    0.5,  0.5,
    0.5,  0.0,
    0.5, -0.5
 ];

 float cubic(float x) {
   float absX = abs(x);
   return 0.5 * absX * absX * absX - absX * absX + 2.0 / 3.0;
 }

 vec3 cubicFilter(vec2 coord) {
   vec3 c = vec3(0.0);
   for (int i = 0; i < 9; i++) {
     vec2 sample = uResolution * (vUv + coord[i]);
     c += texture2D(backBuffer, sample) * cubic(abs(dot(coord, coord)));
   }
   return c;
 }

 void main() {
   vec2 force = uMouse / uResolution - vUv;
   float distance = length(force);

   if (distance < 0.001) {
     gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
     return;
   }

   vec2 newUV = vUv + force * uDeltaTime;

   if (newUV.x < 0.0 || newUV.x > 1.0 || newUV.y < 0.0 || newUV.y > 1.0) {
     gl_FragColor = texture2D(backBuffer, vUv);
     return;
   }

   vec4 color = vec4(0.0);
   for (int i = 0; i < 9; i++) {
     vec2 sample = newUV + sample_kernel[i] * uDeltaTime;
     if (sample.x >= 0.0 && sample.x <= 1.0 && sample.y >= 0.0 && sample.y <= 1.0) {
       color += texture2D(backBuffer, sample);
     }
   }
   color /= 9.0;
   gl_FragColor = color;
 }
`