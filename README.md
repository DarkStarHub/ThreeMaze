https://darkstarhub.github.io/ThreeMaze/

# How I worked on this project

My goal was to learn an interesting new library to build something out of the ordinary to demonstrate creativity and ability to learn
and apply new tech rapidly and effectively.

- For the project I decided to create a maze for a player to navigate, including obstacles, using a recursive backtracker algo to carve a unique maze each run.
- No plugins or game engines, just HTML, CSS, Javascript and Javascript libraries. 
- I chose to learn and implement Three.js to render the 3D assests, and I chose to learn and implement Cannon.js to handle the physics.
- I drew on previous experience with art packages (including Maya and Blender) to create the 3D art assests, while familiarizing myself with the 3D libraries.
- My previous experience with building mobile games made the development rapid, and I found Three.js and Cannon.j worked well together and were straight forward to use.
- I also implemented Howler.js to handle the sounds. 3D sound effects (clap traps and portal hum) were used as well. I created the optimized sound clips and loops using Adobe Audition.
- After everything was up and running, I began optimizing performance. One of the biggest performance gains came from using mesh instancing for the walls of the maze. Was able to get a full 60 frames per sec after using the more advanced features Three.js had to offer. 

# Navigating the project
The script.js file in the JS folder contains all the game logic. The other files are required for the previously mentioned libraries, and the minified libraries themselves. I have unminified verisions of the JS to provide, of course, but the current live version is minified for performance.

# Conclusions
All in all, this was a very fun project, and I'd love the opportunity to work with Three.js or another 3D library again in the future. There are a substantial amount of meshes involved in rendering a 10 x 10 cell maze, as well as all of the geometry involved that is not visible, creating bounds for the physics. I used optimizations such as texture loaders and mesh instancing to increase performance. It is showing a full 60 frames per sec in all devices and browsers I have tested. 

I especially enjoyed getting to learn the new things required to get the job done, and doing something a little out of the box. 
