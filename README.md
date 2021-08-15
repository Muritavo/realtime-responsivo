# What the hell is this

This project is a tool to replicate layout changes on multiple resolutions at the same time

This allows to in realtime see the changes to the stylesheet reflected on multiple resolutions

# How to use it
- Start this application:
    - **Recommended**: You can install this tool globally using <br>``npm i -g @muritavo/realtime-responsive``<br> and starting it with the command:<br>``realtime-responsive`` 
    - You can do so by cloning this project and running yarn start
- Start an instance of the browser that has the web security disabled (since there is communication between iframes)

```bash
# For MAC
open -na /Applications/Google\ Chrome.app --args --disable-web-security --user-data-dir="/tmp/chrome" --disable-site-isolation-trials

```
- Access the application at http://localhost:10000
- By default there are two resolutions configured, you can configure more on advanced config
- Provide the initial URL and be happy :)

# Bugs (Yes)
The implementation of this app is not even close to ideal and you can see glitches after each change to layout/iterations
