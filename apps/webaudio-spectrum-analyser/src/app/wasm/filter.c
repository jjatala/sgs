#include "filter.h"
#include "prominence.h"

EMSCRIPTEN_KEEPALIVE
void filter_start(tdval_t *input, fftval_t *fft_buf, int length) {
  normalize(input, input, length);
  window(input, input, length);
  fft(input, fft_buf, length);
}

EMSCRIPTEN_KEEPALIVE
void filter_end(tdval_t *output, fftval_t *fft_buf, int length) {
  ifft(fft_buf, output, length);
}

EMSCRIPTEN_KEEPALIVE
void gain(fftval_t *fft_buf, int fft_size, number db) {
  int bins = 1 + fft_size / 2;
  number scale = pow(10.0, db / 20.0);
  for (int i = 0; i < bins; ++i) {
    fft_buf[i].r *= scale;
    fft_buf[i].i *= scale;
  }
}

static number get_pitch(
  const fftmag_t *fftmag_buf,
  int fft_bins,
  int sample_rate,
  number min_pitch,
  number max_pitch
) {
  if (fft_bins % 2) {
    --fft_bins;
    ++fftmag_buf;
  }
  int fft_size = fft_bins * 2;
  number cepstrum_bin_size = 2.0 / sample_rate;
  int cepstrum_bins = 1 + fft_bins / 2;
  fftmag_t cepstrum_buf[cepstrum_bins];
  cepstrum(fftmag_buf, cepstrum_buf, fft_size);

  number min_quefrency = 1.0 / max_pitch;
  number max_quefrency = 1.0 / min_pitch;
  int start = round(min_quefrency / cepstrum_bin_size);
  int end = round(max_quefrency / cepstrum_bin_size);
  int peak = index_of_max_peak(cepstrum_buf, cepstrum_bins, start, end);
  if (peak < 0) {
    return -1;
  }
  number offset = interpolate_peak(cepstrum_buf, cepstrum_bins, peak, NULL);
  number peak_quefrency = (peak + offset) * cepstrum_bin_size;
  return 1.0 / peak_quefrency;
}

EMSCRIPTEN_KEEPALIVE
void scale_harmonics(
  fftval_t *fft_buf,
  int fft_size,
  int sample_rate,
  number min_pitch,
  number max_pitch,
  int min_harmonic,
  int max_harmonic,
  int step,
  number factor,
  number f_scale_radius,
  number harmonic_search_radius,
  int smooth_scale
) {
  int bins = 1 + fft_size / 2;
  number bin_size = (number)sample_rate / fft_size;
  int scale_radius = ceil(f_scale_radius / bin_size);

  min_harmonic = max(1, min_harmonic);
  max_harmonic = max(1, max_harmonic);
  step = max(1, step);

  fftmag_t magnitude_buf[bins];
  magnitude(fft_buf, magnitude_buf, bins, TRUE);

  int peak;
  number pitch = get_pitch(
    magnitude_buf,
    bins,
    sample_rate,
    min_pitch,
    max_pitch
  );

  if (pitch > 0) {
    int h = min_harmonic;
    if (h == 1 && h <= max_harmonic) {
      peak = round(pitch / bin_size);
      fft_scale(
        fft_buf, bins,
        peak, scale_radius,
        factor, smooth_scale
      );
      h += step;
    }
    for (; h <= max_harmonic; h += step) {
      number f_min = (h - harmonic_search_radius) * pitch;
      number f_max = (h + harmonic_search_radius) * pitch;
      int start = round(f_min / bin_size);
      int end = round(f_max / bin_size);
      if (start >= bins) {
        break;
      }
      peak = index_of_max_peak(magnitude_buf, bins, start, end);
      if (peak > 0) {
        fft_scale(
          fft_buf, bins,
          peak, scale_radius,
          factor, smooth_scale
        );
      }
    }
  }
}

EMSCRIPTEN_KEEPALIVE
void add_harmonics(
  fftval_t *fft_buf,
  int fft_size,
  int sample_rate,
  number min_pitch,
  number max_pitch,
  int min_harmonic,
  int max_harmonic,
  int step,
  number f_copy_radius,
  number harmonic_search_radius,
  int smooth_copy
) {
  int bins = 1 + fft_size / 2;
  number bin_size = (number)sample_rate / fft_size;
  int copy_radius = ceil(f_copy_radius / bin_size);

  min_harmonic = max(1, min_harmonic);
  max_harmonic = max(1, max_harmonic);
  step = max(1, step);

  fftmag_t magnitude_buf[bins];
  magnitude(fft_buf, magnitude_buf, bins, TRUE);

  int peak;
  number pitch = get_pitch(
    magnitude_buf,
    bins,
    sample_rate,
    min_pitch,
    max_pitch
  );

  if (pitch <= 0) {
    return;
  }

  magnitude(fft_buf, magnitude_buf, bins, FALSE);

  number new_pitch = pitch * 0.5;
  int h = min_harmonic;
  if (h == 1 && h <= max_harmonic) {
    number new_harmonic = new_pitch;
    int new_peak = round(new_harmonic / bin_size);
    peak = round(pitch / bin_size);
    fft_copy(
      fft_buf, bins,
      peak, new_peak, copy_radius,
      1.0, smooth_copy
    );
    //h += step;
  }
  for (; h <= max_harmonic; h += step) {
    number f_min = (h - harmonic_search_radius) * pitch;
    number f_max = (h + harmonic_search_radius) * pitch;
    int start = round(f_min / bin_size);
    int end = round(f_max / bin_size);
    if (start >= bins) {
      break;
    }

    peak = index_of_max_peak(magnitude_buf, bins, start, end);
    if (peak < 0) {
      continue;
    }

    int next_peak = -1;
    for (int dh = 1; dh < 3 && next_peak < 0; ++dh) {
      start = round((f_min + dh * pitch) / bin_size);
      end = round((f_max + dh * pitch) / bin_size);
      if (start >= bins) {
        break;
      }
      next_peak = index_of_max_peak(magnitude_buf, bins, start, end);
    }
    if (next_peak < 0) {
      continue;
    }

    int new_peak = (peak + next_peak) / 2;
    number scale = 0.5 + magnitude_buf[next_peak] / (2 * magnitude_buf[peak]);
    scale = clamp(scale, 0.0, 1.0);
    fft_copy(
      fft_buf, bins,
      peak, new_peak, copy_radius,
      scale, smooth_copy
    );
  }
}
