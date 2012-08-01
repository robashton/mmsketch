func fmin(a, b, c float64) float64 {
	return math.Fmin(math.Fmin(a, b), c)
}

func fmax(a, b, c float64) float64 {
	return math.Fmax(math.Fmax(a, b), c)
}

// Ported from Python colorsys
func rgb_to_hls(r, g, b float64) (float64, float64, float64) {
	var h, l, s float64
	maxc := fmax(r, g, b)
	minc := fmin(r, g, b)
	l = (minc + maxc) / 2.0
	if minc == maxc {
		return 0.0, l, 0.0
	}
	span := (maxc - minc)
	if l <= 0.5 {
		s = span / (maxc + minc)
	} else {
		s = span / (2.0 - maxc - minc)
	}
	rc := (maxc - r) / span
	gc := (maxc - g) / span
	bc := (maxc - b) / span
	if r == maxc {
		h = bc - gc
	} else if g == maxc {
		h = 2.0 + rc - bc
	} else {
		h = 4.0 + gc - rc
	}
	h = math.Fmod((h / 6.0), 1.0)
	return h, l, s
}

// Ported from Python colorsys
func _v(m1, m2, hue float64) float64 {
	ONE_SIXTH := 1.0 / 6.0
	TWO_THIRD := 2.0 / 3.0
	hue = math.Fmod(hue, 1.0)
	if hue < ONE_SIXTH {
		return m1 + (m2-m1)*hue*6.0
	}
	if hue < 0.5 {
		return m2
	}
	if hue < TWO_THIRD {
		return m1 + (m2-m1)*(TWO_THIRD-hue)*6.0
	}
	return m1
}

// Ported from Python colorsys
func hls_to_rgb(h, l, s float64) (float64, float64, float64) {
	ONE_THIRD := 1.0 / 3.0
	if s == 0.0 {
		return l, l, l
	}
	var m2 float64
	if l <= 0.5 {
		m2 = l * (1.0 + s)
	} else {
		m2 = l + s - (l * s)
	}
	m1 := 2.0*l - m2
	return _v(m1, m2, h+ONE_THIRD), _v(m1, m2, h), _v(m1, m2, h-ONE_THIRD)
}

// Thanks to Mark Ransom
func paintMix(c1, c2 image.RGBAColor) image.RGBAColor {
	pi := 3.1415 // Using math.Pi gives a completely different result, for some reason
	h1, l1, s1 := rgb_to_hls(float64(c1.R)/255.0, float64(c1.G)/255.0, float64(c1.B)/255.0)
	h2, l2, s2 := rgb_to_hls(float64(c2.R)/255.0, float64(c2.G)/255.0, float64(c2.B)/255.0)
	h := 0.0
	s := 0.5 * (s1 + s2)
	l := 0.5 * (l1 + l2)
	x := math.Cos(2.0*pi*h1) + math.Cos(2.0*pi*h2)
	y := math.Sin(2.0*pi*h1) + math.Sin(2.0*pi*h2)
	if (x != 0.0) || (y != 0.0) {
		h = math.Atan2(y, x) / (2.0 * pi)
	} else {
		s = 0.0
	}
	r, g, b := hls_to_rgb(h, l, s)
	return image.RGBAColor{uint8(r * 255.0), uint8(g * 255.0), uint8(b * 255.0), 255}
}

