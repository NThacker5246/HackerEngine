//Hacker Engine: Alpha 1-23
//CopyRight NThacker 08.2024 - 05.2025
#version 130

uniform vec2 u_mouse;
uniform vec3 u_pos;
uniform int u_action;

int beetween(float x, float y, float n){
	if(abs(x - y) <= n) return 1;
	return 0;
}

float Dist(vec3 a, vec3 b){
	vec3 ab = a - b;
	ab = abs(ab);
	return pow(ab.x * ab.x + ab.y * ab.y + ab.z * ab.z, 0.5);
}

void refract(inout vec3 ro, inout vec3 rd, in vec2 intersect, in float alpha, in vec3 n){
	ro += rd * (intersect.y + 0.001);
	float eta = 1.0 / (1.0 - alpha);
	float stn = dot(n, rd);
	float k = 1.0 - eta * eta * (1.0 - stn * stn);
	rd = eta * rd - (eta * stn + sqrt(k)) * n;
}

mat2 rot(float a) {
	float s = sin(a);
	float c = cos(a);
	return mat2(c, -s, s, c);
}

vec2 sphIntersect(in vec3 ro, in vec3 rd, float ra) {
	float b = dot(ro, rd);
	float c = dot(ro, ro) - ra * ra;
	float h = b * b - c;
	if(h < 0.0) return vec2(-1.0);
	h = sqrt(h);
	return vec2(-b - h, -b + h);
}

vec2 boxIntersection(in vec3 ro, in vec3 rd, in vec3 rad, out vec3 oN)  {
	vec3 m = 1.0 / rd;
	vec3 n = m * ro;
	vec3 k = abs(m) * rad;
	vec3 t1 = -n - k;
	vec3 t2 = -n + k;
	float tN = max(max(t1.x, t1.y), t1.z);
	float tF = min(min(t2.x, t2.y), t2.z);
	if(tN > tF || tF < 0.0) return vec2(-1.0);
	oN = -sign(rd) * step(t1.yzx, t1.xyz) * step(t1.zxy, t1.xyz);
	return vec2(tN, tF);
}

float plaIntersect(in vec3 ro, in vec3 rd, in vec4 p) {
	return -(dot(ro, p.xyz) + p.w) / dot(rd, p.xyz);
}

vec3 getSkyBox(vec3 rd){
	vec3 sky = vec3(0.52941176470588235294117647058824, 0.8078431372549019607843137254902, 0.92156862745098039215686274509804);
	vec3 sun = vec3(0.95, 0.9, 1.0);

	sun *= max(0.0, pow(clamp(dot(rd, normalize(sun)), -1, 0), 32.0)) * 0.5;

	return clamp(sky + sun, 0.0, 1.0);

}

vec3 castRay(inout vec3 ro, inout vec3 rd){
	vec3 color;
	vec3 col;
	vec2 minIt = vec2(99999.0);
	vec3 n;

	vec3 boxColor = vec3(0.3, 0.9, 0.4);
	vec3 plaColor = vec3(0.9, 0.4, 0.4);
	vec3 sphColor = vec3(0.4, 0.3, 0.9);
	
	vec3 light = vec3(0.95, 0.9, 1.0) * -1;
	light = normalize(light);

	vec3 spherePos = vec3(-0.0125, -3.25, -0.1);
	
	vec2 it = sphIntersect(ro - spherePos, rd, 1.0);

	if((it.x > 0.0 && it.x < minIt.x) || (it.y > 0.0 && it.y < minIt.y)){
		minIt = it;
		vec3 itPos = ro + rd * it.x - spherePos;
		n = normalize(itPos);
		col = sphColor;
	}
	

	vec3 boxN;

	it = boxIntersection(ro, rd, vec3(1.0), boxN);

	if((it.x > 0.0 && it.x < minIt.x) || (it.y > 0.0 && it.y < minIt.y)){
		minIt = it;
		n = boxN;
		col = boxColor;
	}
	
	/*
	vec3 plaN = vec3(0.0, 0.0, -1.0);

	it = vec2(plaIntersect(ro, rd, vec4(plaN, 1.0)));

	if(it.x > 0.0 && it.x < minIt.x){
		minIt = it;
		n = plaN;
		col = plaColor;
	}
	
	*/

	if(minIt.x == 99999.0){
		return getSkyBox(rd);
	}



	col.x = pow(col.x, 0.45);
	col.y = pow(col.y, 0.45);
	col.z = pow(col.z, 0.45);

	float diffuse = max(dot(n, light), 0.0) * 0.75;

	vec3 relfected = rd - 2.0 * dot(n, rd) * n;
	float specular = pow(max(0.0, dot(relfected, light)), 32.0);
	color = vec3(diffuse + specular) * col;

	return color;
}


vec3 castLength(inout vec3 ro, inout vec3 rd){
	vec3 color;
	vec3 col;
	vec2 minIt = vec2(99999.0);
	vec3 n;
	float sz = 5000;

	vec3 boxColor = vec3(0.3, 0.9, 0.4);
	vec3 plaColor = vec3(0.9, 0.4, 0.4);
	vec3 sphColor = vec3(0.4, 0.3, 0.9);
	

	vec3 light = vec3(0.95, 0.9, 1.0) * -1;
	light = normalize(light);

	vec3 spherePos = vec3(-0.0125, -3.25, -0.1);
	
	vec2 it = sphIntersect(ro - spherePos, rd, 1.0);

	if((it.x > 0.0 && it.x < minIt.x) || (it.y > 0.0 && it.y < minIt.y)){
		minIt = it;
		vec3 itPos = ro + rd * it.x - spherePos;
		n = normalize(itPos);
		col = sphColor;
		sz = 1;
	}
	

	vec3 boxN;

	it = boxIntersection(ro, rd, vec3(1.0), boxN);

	if((it.x > 0.0 && it.x < minIt.x) || (it.y > 0.0 && it.y < minIt.y)){
		minIt = it;
		n = boxN;
		col = boxColor;
		sz = 1;
	}
	
	/*
	vec3 plaN = vec3(0.0, 0.0, -1.0);


	it = vec2(plaIntersect(ro, rd, vec4(plaN, 1.0)));

	if(it.x > 0.0 && it.x < minIt.x){
		minIt = it;
		n = plaN;
		col = plaColor;
	}
	
	*/
	if(beetween(ro.z, n.z, 1) == 1 && beetween(ro.x, n.x, 1) == 1 && beetween(ro.y, n.y, 1) == 1){
		return vec3(1);
	}

	if(minIt.x > sz){
		//return getSkyBox(rd);
		return vec3(0, 0, 0);
	}





	/*col.x = pow(col.x, 0.45);
	col.y = pow(col.y, 0.45);
	col.z = pow(col.z, 0.45);

	float diffuse = max(dot(n, light), 0.0) * 0.75;

	vec3 relfected = rd - 2.0 * dot(n, rd) * n;
	float specular = pow(max(0.0, dot(relfected, light)), 32.0);
	color = vec3(diffuse + specular) * col;
	*/
	return vec3(1, 1, 1);
}

void main(){
	vec2 uv = gl_TexCoord[0].xy - 0.5;
	uv *= 2;

	vec3 ro = u_pos;
	vec3 rd = vec3(1, uv);
	
	rd = normalize(rd);
	//ro.yz += uv * 2;

	


	

	ro += rd;
	rd = vec3(1, 0, 0);
	
	rd = normalize(rd);
	rd.zx *= rot(-u_mouse.y);
	rd.xy *= rot(u_mouse.x);
	if(u_action == 1){
		gl_FragColor = vec4(castLength(ro, rd), 1.0);
	} else {
		gl_FragColor = vec4(castRay(ro, rd), 1.0);
	}
}
