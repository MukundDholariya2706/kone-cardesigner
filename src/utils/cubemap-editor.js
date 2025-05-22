let callback = null;
let mapUpdateCb = null;
let materialManager = null;
let parentGui = null;

export function initializeCubemapGUI(mm, cb, mapcb) {
  callback = cb;
  mapUpdateCb = mapcb;
  materialManager = mm;
}

export default initializeCubemapGUI;
