#!/bin/sh

set -e

for alias in 'emcc' 'emconfigure' 'emmake' 'emar'; do
  # docker run -e 'EMCC_DEBUG=1' ...
  alias $alias="docker run -it --rm -m 2g -w='/home/src/' -v `pwd`:/home/src 42ua/emsdk $alias"
done
unset alias

if [ ! -d "picsim-0.6" ]; then
  git clone https://github.com/lcgamboa/picsim.git picsim-0.6
  cd picsim-0.6
  # 4d8a31704ab046b8320dbaa03dd4445111e69ca9
  # 1bf9b3ff00945cd71b7a83dd6ba235239e5488e9
  # 821792f546474ebab0de81fd14aab12f204d2aff -- < ADC hangs
  git checkout e323b075137a76c0e7d320eaa06cfa0808dce3de

  # cd picsim-0.6/src && git diff Makefile > ../../patches/Makefile.patch && cd -
  patch -p1 < ../patches/Makefile.patch

  cd -

fi
  
# emmake make -C picsim-0.6 clean
emmake make -C picsim-0.6/src libpicsim.a

emcc -O3 embind.cpp \
  --memory-init-file 0 --bind -o ./picsim-0.6/picsim.js ./picsim-0.6/src/libpicsim.a 

{
  echo '
    var Module = {};
    Module.preRun = function() {
      FS.mkdir("/home/picsim");
      FS.chdir("/home/picsim");
      // console.log(FS.cwd());
      // console.log(FS.readdir("."));
    };'
  cat ./picsim-0.6/picsim.js
} > picsim.js

{
  echo 'var pic_sim_module = (function () {'
  cat ./picsim.js
  echo 'return Module;'
  echo '})();'
} > ../ui/ng2/src/assets/picsim.browser.js