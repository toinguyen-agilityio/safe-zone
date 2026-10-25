export const world = {
  mapSize: 640,
  defaultSeed: 20261023,
  maxDt: 0.05,
  streetWidth: 14,
  /** Centers of the north-south streets (x) and east-west streets (z). */
  streetXs: [-240, -160, -80, 0, 80, 140],
  streetZs: [-240, -160, -80, 0, 80, 160, 240],
  /** East-west streets stop here, before the river west bank. */
  streetEastEnd: 150,
  river: {
    baseX: 220,
    curveAmplitude: 30,
    curveLength: 90,
    width: 50,
    sampleStep: 40,
  },
  bridgeDeckWidth: 16,
  bridgeZs: { han: -120, dragon: 40, tranThiLy: 200 },
  bridgeRampLength: 30,
} as const;
