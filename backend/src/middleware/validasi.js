export function validasi(skema, sumber = 'body') {
  return (req, res, next) => {
    req[sumber] = skema.parse(req[sumber]);
    next();
  };
}
