#ifndef PROMINENCE_H_INCLUDED
#define PROMINENCE_H_INCLUDED

#include "common.h"

void prominence(
  fftval_t *fft,
  fftval_t *res,
  int length,
  int start,
  int end,
  int radius,
  fftval_t fftval_min,
  fftval_t fftval_max,
  bool normalize
);

int prominencepeak(
  fftval_t *fft,
  fftval_t *prdata,
  int length,
  int start,
  int end,
  int radius,
  fftval_t fftval_min,
  fftval_t fftval_max,
  fftval_t threshold,
  fftpeak_t type,
  bool normalize
);

#endif
