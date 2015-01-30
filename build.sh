cd js/visualizers/

gpm_html=""
yt_html=""
cases=""

for f in *.js
do
    trim=${f%.*} #Remove extension
    
    functionLine=$(grep $f -e 'function')
    functionCall=($functionLine)
    
    #visualizer.js case string
    cases=$cases"\t\t\tcase '"$trim"': \n" #Name of file without extension
    cases=$cases"\t\t\t\t"${functionCall[1]}${functionCall[4]}"; \n"
    cases=$cases"\t\t\t\tbreak; \n"
    
    #GPM string
    gpm_html=$gpm_html"<div id=\""$trim"\" class=\"goog-menuitem\" role=\"menuitem\" style=\"-webkit-user-select: none;\">\n"
    gpm_html=$gpm_html"\t<div class=\"goog-menuitem-content\">"${trim/-/ }"</div>\n"
    gpm_html=$gpm_html"</div>\n\n"
    
    #YoutTube string
    yt_html=$yt_html"<li>\n"
    yt_html=$yt_html"\t<span id=\""$trim"\" class=\"yt-uix-button-menu-item\">"${trim/-/ }"</span>\n"
    yt_html=$yt_html"</li>\n\n"
done

cd ../
awk -v cases="$cases" '/switch \(Visualizer.visualType\)/{print $0 RS cases RS;next}1' visualizer.js > full-visualizer.js
#cat visualizer.js > full-visualizer.js
cat visualizers/*.js >> full-visualizer.js

cd ../
echo $gpm_html > html/gpm-menu-dropdown.html
echo $yt_html > html/yt-menu-dropdown.html


