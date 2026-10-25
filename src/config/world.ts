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
    bedDepth: 4,
    waterLevel: -1.2,
  },
  houses: {
    /** Gap kept between houses and the street edge. */
    margin: 0.5,
    frontageMin: 4,
    frontageMax: 6,
    /** Narrowest house worth building; leftovers thinner than this become empty lot. */
    minFrontage: 3,
    alleyWidth: 3,
    /** An alley (kiet) crosses the block after this many houses (inclusive range). */
    alleyEveryMin: 4,
    alleyEveryMax: 7,
    /** Height range (world units) of houses in the inner blocks. */
    innerHeight: { min: 6, max: 12 },
    /** Houses within `riverBand` of the river bank become high-rises. */
    riverBand: 40,
    riverHeight: { min: 25, max: 45 },
  },
  /** Ground and river continue this far past the map edge so no gap shows. */
  edgePadding: 100,
  bridgeDeckWidth: 16,
  bridgeZs: { han: -120, dragon: 40, tranThiLy: 200 },
  bridgeRampLength: 30,
} as const;
