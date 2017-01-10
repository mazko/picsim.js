#!/bin/sh

set -e

for alias in 'emcc' 'emconfigure' 'emmake' 'emar'; do
  # docker run -e 'EMCC_DEBUG=1' ...
  alias $alias="docker run -it --rm -m 2g -w='/home/src/' -v `pwd`:/home/src 42ua/emsdk $alias"
done
unset alias

if [ ! -d "picsim-0.6" ]; then
  curl -sL https://netcologne.dl.sourceforge.net/project/picsim/picsim/picsim-0.6/picsim-0.6.tgz | tar xz
  cd picsim-0.6
  git init && git add . && git commit -m 'f'

  # cd picsim-0.6 && git diff Makefile > ../patches/Makefile.patch && cd -
  patch -p1 < ../patches/Makefile.patch

  cd -

fi
  
# emmake make -C picsim-0.6 clean
emmake make -C picsim-0.6 libpicsim.a

emcc -O3 embind.cpp \
  --memory-init-file 0 --bind -o ./picsim-0.6/picsim.js ./picsim-0.6/libpicsim.a 

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