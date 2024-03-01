https://darkstarhub.github.io/ThreeMaze/

# Summary of the project
In this project, my objective was twofold: to explore a new and intriguing library, showcasing my creativity and rapid tech adoption skills. Eschewing plugins or game engines, I leveraged HTML, CSS, and JavaScript, alongside the powerful Three.js library for rendering 3D assets and Cannon.js for physics.

The maze, intricately carved using a recursive backtracker algorithm, added a unique challenge for players on each run. My familiarity with art packages like Maya and Blender facilitated the creation of 3D assets, seamlessly integrating them into the project. Having a background in mobile game development expedited the process, with Three.js and Cannon.js proving to be a seamless combination for rendering and physics.

To enhance the immersive experience, I incorporated Howler.js for sound handling, creating 3D sound effects like clap traps and portal hum. The optimization phase was crucial, and mesh instancing for maze walls emerged as a performance game-changer. Through this endeavor, I not only demonstrated my proficiency in leveraging advanced features of Three.js but also showcased my ability to optimize and deliver a smooth, 60-frames-per-second experience. This project stands as a testament to my passion for learning, creative application of technology, and efficient problem-solving in web development.


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
The script.js file in the JS folder contains all the game logic. The other files are required for the previously mentioned libraries, and the minified libraries themselves.

# Conclusions
All in all, this was a very fun project, and I'd love the opportunity to work with Three.js or another 3D library again in the future. There are a substantial amount of meshes involved in rendering a 10 x 10 cell maze, as well as all of the geometry involved that is not visible, creating bounds for the physics. I used optimizations such as texture loaders and mesh instancing to increase performance. It is showing a full 60 frames per sec in all devices and browsers I have tested. 

The best part for me was the learning process. Figuring out the new things needed to make this project work was a rewarding challenge. Doing something a bit different from the usual was exciting, and it showcased my ability to adapt and keep learning in the ever-evolving world of web development. I'm enthusiastic about using these skills in future projects, whether it's with Three.js or other 3D libraries, as this experience fueled my passion for pushing the limits of web development.






