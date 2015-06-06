git checkout gh-pages
git merge master
jade . -o  public --pretty
git add .
git commit -m 'deploy'
git pull
git push
git checkout master