
////imports=======================================================
////greensock import
const gsap = window.gsap;
////dat.gui import
const datG = window.dat.gui;

const sizes = {width:window.innerWidth,height:window.innerHeight};

const dGui = new dat.GUI();
////imports=======================================================


////stats=========================================================
function createStats() {
  var stats = new Stats();
  stats.setMode(0);
  //stats.setMode(1);
  //stats.setMode(2);

  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0';
  stats.domElement.style.top = '0';

  return stats;
}
////stats=========================================================










////create scene==================================================================
const scene = new THREE.Scene();
////create scene==================================================================



////Axes helper==================================================================
const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);
////axes helper==================================================================



////create camera==================================================================
//const camera = new THREE.PerspectiveCamera( 75,window.innerWidth/window.innerHeight);
const camera = new THREE.PerspectiveCamera( 60,sizes.width/sizes.height);
camera.position.z = 5;
camera.position.x = 0;
camera.position.y = 5.7;

camera.rotateX((Math.PI/180)*-25);

//camera.lookAt(new THREE.Vector3())
////create camera==================================================================



////create canvas==================================================================
//const canvas = document.body;
const canvas = document.querySelector('canvas.webgl');
////create canvas==================================================================



////orbit controls==================================================================
//const controls = new OrbitControls(camera,canvas);
//controls.enableDamping = true;
//controls.update();
////orbit controls==================================================================



////create renderer==================================================================
const renderer = new THREE.WebGLRenderer({ canvas:canvas, antialias: true});
renderer.setSize(sizes.width,sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
//canvas.appendChild(renderer.domElement);
//document.body.appendChild( renderer.domElement);
renderer.shadowMap.enabled = true;
//renderer.setClearColor('#ff0000');
////create renderer==================================================================


////for stats
stats = createStats();
document.body.appendChild( stats.domElement );



////browser resizing==================================================================
window.addEventListener('resize',()=>
{
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width/sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width,sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
});
////browser resizing==================================================================



////texture loading==================================================================
const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);
/*const colorTexture = textureLoader.load('assets/door/color.jpg');
const alphaTexture = textureLoader.load('assets/door/alpha.jpg');
const heightTexture = textureLoader.load('assets/door/height.jpg');
const normalTexture = textureLoader.load('assets/door/normal.jpg');
const ambientOcclusionTexture = textureLoader.load('assets/door/ambientOcclusion.jpg');
const metalnessTexture = textureLoader.load('assets/door/metalness.jpg');
const roughnessTexture = textureLoader.load('assets/door/roughness.jpg');


const matCapTexture = textureLoader.load('assets/matcaps/9.jpg');
const gradientTexture = textureLoader.load('assets/gradients/3.jpg');


colorTexture.repeat.x = 2;
colorTexture.repeat.y = 2;
colorTexture.wrapS = THREE.RepeatWrapping;
colorTexture.wrapT = THREE.RepeatWrapping;*/

const bgTexture = textureLoader.load('assets/bg.jpg');
scene.background = bgTexture;
////texture loading==================================================================






////Mine==================================================================
const floorTileTexture = textureLoader.load('assets/grass_4.png');
floorTileTexture.repeat.x = 6;
floorTileTexture.repeat.y = 6;
floorTileTexture.wrapS = THREE.RepeatWrapping;
floorTileTexture.wrapT = THREE.RepeatWrapping;
const floorMat = new THREE.MeshStandardMaterial({map:floorTileTexture})

const mWidth = 10;
const mLength = 10;

const exitX = Math.floor((Math.random() * mWidth));
const exitY = mLength-1;

const entX = 1;
const entY = 0;


let curX = 1;
let curY = 0;
let curTile = 0;

let neighborCount = 0;


let cellArrayNew = [];//values per wall-  1 south, 2 west, 4 north, 8 east

let Visited = [];
let theStack = [];

let recSteps = 0;


let longestDistance = 0;
let furthestPoint = 0;



const baseMat = new THREE.MeshStandardMaterial();
const baseMat2 = new THREE.MeshStandardMaterial({
  color: '#ff6666'
});
const baseMat3 = new THREE.MeshStandardMaterial({
  color: '#110033'
});

//controls.enableZoom = false;
//controls.enablePan = false;


const gltfLoader = new GLTFLoader();



//physics
const world = new CANNON.World();

//// cannon debugger
//const cannonDebugger = new CannonDebugger(scene,world);

world.broadPhase = new CANNON.SAPBroadphase(world);
//world.allowSleep = true;
world.gravity.set(0,-9.82,0);

const objectsToUpdate = [];
const trapsToUpdate = [];

const NWshape = new CANNON.Box(new CANNON.Vec3(.48,2.5,5));  
const tileShape = new CANNON.Box(new CANNON.Vec3(5,.5,5));  
const EWshape = new CANNON.Box(new CANNON.Vec3(.48,2.5,5));  

const clapTrapShape = new CANNON.Box(new CANNON.Vec3(4.25,2.05,.5)); 
//physics


function RetLoadString()
{
  const num = Math.floor((Math.random() * 4));
  let loadString = 'assets/Walls/wall11tx.glb';
  switch(num)
  {    
    case 0:    
    loadString = 'assets/Walls/wall11tx.glb'
    break;
  
    case 1:      
    loadString = 'assets/Walls/wall22tx.glb'
    break;

    case 2:     
    loadString = 'assets/Walls/wall33tx.glb'  
    break;

    case 3:      
    loadString = 'assets/Walls/wall44tx.glb' 
    break;
  }
  return loadString;
}


function BuildTile(xPos,zPos,incCellObj)
{    
  const num = Math.floor((Math.random() * 4));
  let loadString = 'assets/Walls/tile11tx.glb';
  switch(num)
  {    
    case 0:    
    loadString = 'assets/Walls/tile11tx.glb'
    break;
    
    case 1:      
    loadString = 'assets/Walls/tile22tx.glb'
    break;

    case 2:     
    loadString = 'assets/Walls/tile33tx.glb'  
    break;

    case 3:      
    loadString = 'assets/Walls/tile44tx.glb' 
    break;
  }
  gltfLoader.load(
    //'assets/fTile2.gltf',
    loadString,
    (gltf) =>
    {
      //const newTile = gltf.scene.children[0];
      const newTile = gltf.scenes[0].children[0];
      newTile.position.x = xPos*10;
      newTile.position.y = 0;
      newTile.position.z = (zPos*10)*-1;    
      newTile.scale.set(1,1,1);          
      scene.add(newTile);
      
      //incCellGroup.add(newEWall); 
      incCellObj.tileObj = newTile; 
      //incCellObj.cellG.add(newTile);
      
      
      //const tileShape = new CANNON.Box(new CANNON.Vec3(5,.5,5));  
      const body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(newTile.position.x,newTile.position.y-.5,newTile.position.z),      
      shape: tileShape,
      // material: defaultMaterial
      });      
      //body.position.copy(position);
      ///body.addEventListener('collide',playHitSound);
      world.addBody(body);  

      incCellObj.tileCol = body;
      

     /*
      const modelPackage = {
        model:newEWall,
        col:body
      };*/

      /*
      let modelArr = [];
      modelArr.push(newEWall);
      modelArr.push(body);
      console.log(modelArr);

      incNewCellGroup.add(modelArr);*/

      /*
      objectsToUpdate.push({
      mesh: mesh,
      body: body
      });*/
    }
  );
}



function BuildEWall(xPos,zPos,incCellObj)
{  
  let loadString = RetLoadString();
 
  gltfLoader.load(
    loadString,
    //'assets/eWall.gltf',
    (gltf) =>
    {
      const newWall = gltf.scenes[0].children[0];
      //newWall.position.x = xPos*10;
      newWall.position.x = xPos*10 +4.8;
      newWall.position.y = 0;
      newWall.position.z = (zPos*10)*-1; 
      newWall.rotation.z = Math.PI / 2;
      newWall.scale.set(1,1,1);            
      scene.add(newWall);

      //incCellGroup.add(newEWall); 
      incCellObj.ewObj = newWall;
      //incCellObj.cellG.add(newWall);
      
      //const EWshape = new CANNON.Box(new CANNON.Vec3(.48,2.5,5));  
      const body = new CANNON.Body({
      mass: 0,
      //position: new CANNON.Vec3(newWall.position.x+ 4.8,newWall.position.y +2.5,newWall.position.z),
      position: new CANNON.Vec3(newWall.position.x,newWall.position.y +2.5,newWall.position.z),
      shape: EWshape,
      // material: defaultMaterial
      });
      //body.position.copy(position);
      ///body.addEventListener('collide',playHitSound);
      world.addBody(body); 
      incCellObj.ewCol = body;    
    }
  );
}


function BuildNWall(xPos,zPos,incCellObj)
{  
  let loadString = RetLoadString();
 
  gltfLoader.load(
    loadString,
    //'assets/eWall.gltf',
    (gltf) =>
    {
      const newWall = gltf.scenes[0].children[0];
      //const newEWall = gltf.scene.children[0];
      //const newEWall = gltf.scenes[0].children[0];
      newWall.position.x = xPos*10;
      newWall.position.y = 0;
      newWall.position.z = ((zPos*10)*-1)-4.8;  
      newWall.scale.set(1,1,1);            
      scene.add(newWall);

      //incCellGroup.add(newEWall); 
      incCellObj.nwObj = newWall;
      //incCellObj.cellG.add(newWall);
      
      
      //const NWshape = new CANNON.Box(new CANNON.Vec3(.48,2.5,5));  
      const body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(newWall.position.x,newWall.position.y +2.5,newWall.position.z),
      
      shape: NWshape,
      // material: defaultMaterial
      });
      body.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0),Math.PI*.5)
      //body.position.copy(position);
      ///body.addEventListener('collide',playHitSound);
      world.addBody(body);  
      incCellObj.nwCol = body;    
    }
  );
}



function RawMazeBuild()
{
  //const startT = Date.now();

  curTile = (curX*mWidth)+curY;   
 
  //this should be block units
  for(let row = 0; row<mWidth; row++)
  {
    for(let column = 0; column<mLength; column++)
    { 
      
      //const cellGroup = new THREE.Group();
      //scene.add(cellGroup);

      let colObj = {
        //cellG: cellGroup,
        tileObj: null,
        nwObj: null,
        ewObj: null,
        tileCol: null,
        nwCol: null,
        ewCol: null,
        tileTypeId: 15,
        tileOccupantId: 0
      };
      
      

      
      //BuildTile(row,column,colObj);      
      BuildEWall(row,column,colObj);
      //BuildNWall(row,column,colObj);
        

      //cellArray.push(cellGroup);
      cellArrayNew.push(colObj);
    }
    
    //deduct from entrance
    

  }
  



  //place posts
  for(let row = 0;row<mWidth+1;row++)
  {
    for(let column = 0;column<mLength+1;column++)
    {
      gltfLoader.load(
        'assets/pillar.glb',
        (gltf) =>
        {
          const newPost = gltf.scenes[0].children[0];
          newPost.position.x = (row*10)-5.1;
          newPost.position.y = 0;
          newPost.position.z = ((column*10)-5.1)*-1; 
          newPost.scale.set(1,1,1);             
          scene.add(newPost);         
        }
      );
    }
  }
  // place posts  


  //edge walls front
  for(let row = 0;row<mWidth;row++)
  {
    if(row == entX) // this is the entrance
    {
      continue;
    }  

    let loadString1 = RetLoadString();    

    gltfLoader.load(
      loadString1,
      //'assets/sWall.gltf',
      (gltf) =>
      {
        const newSWall = gltf.scenes[0].children[0];        
        newSWall.position.x = row*10;
        newSWall.position.y = 0;
        newSWall.position.z = 4.8;  
        newSWall.scale.set(1,1,1),            
        scene.add(newSWall); 
        
        const body = new CANNON.Body({
          mass: 0,
          position: new CANNON.Vec3(newSWall.position.x,newSWall.position.y +2.5,newSWall.position.z),
          
          shape: NWshape
          // material: defaultMaterial
        });
        body.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0),Math.PI*.5);
         
        world.addBody(body);         
      }
    );
  }


  //left side walls
  for(let column = 0;column<mLength;column++)
  {    
    let loadString = RetLoadString();

    gltfLoader.load(
      loadString,
      //'assets/wWall.gltf',
      (gltf) =>
      {
        const newWWall = gltf.scenes[0].children[0];
        newWWall.position.x = -4.8; // 
        newWWall.position.y = 0;
        newWWall.position.z = ((column*10)*-1); 
        newWWall.rotation.z = Math.PI / 2;
        newWWall.scale.set(1,1,1);
        scene.add(newWWall);  
        
        const body = new CANNON.Body({
          mass: 0,
          position: new CANNON.Vec3(newWWall.position.x,newWWall.position.y +2.5,newWWall.position.z),
          shape: EWshape
          // material: defaultMaterial
        });          
        world.addBody(body); 
      }
    );
  }
  //edge walls
  


   Visited.push(curTile);
   theStack.push(curTile);
  
  
   //const endT = Date.now();
   //console.log(endT - startT);  
};


function CarveExit()
{
  
  //open exit
  const exitCell = (exitX*10)+exitY;
  //console.log(exitCell,cellArrayNew[exitCell].cellG.children.length);
  //for(let i =0;i<cellArrayNew[exitCell].cellG.children.length;i++)
  //{
    
    //if(cellArrayNew[exitCell].cellG.children[i].name == "nWall")
    if(cellArrayNew[exitCell].nwObj !== null)
    {
      var toGo = cellArrayNew[exitCell].nwObj; 
      scene.remove(toGo);
      cellArrayNew[exitCell].tileTypeId -= 4;
      world.remove(cellArrayNew[exitCell].nwCol);
      //console.log(cellArrayNew[exitCell].tileTypeId);
      
    }
    
  //}
}



function CheckFurthestPoint()
{
  if(theStack.length > longestDistance)
  {
    furthestPoint = theStack[theStack.length-1];
    longestDistance = theStack.length;
  }
}



function TakeAStep()
{ 
  const nX = Math.floor(curTile/mWidth);
  const nY = (curTile%mWidth);

  const dir = Math.floor((Math.random() * 4));

  
  

  //cell to the west ---to the left 
  if(dir == 0  && (nX-1)>=0)
  {    
    if(!Visited.includes(((nX-1)*mWidth)+nY))
    {       
      cellArrayNew[curTile].tileTypeId -= 2;// - 2 for west wall on this cell

      curX -=1;
      curTile = (curX*mWidth)+curY;      

      Visited.push(curTile);
      theStack.push(curTile);
      
     // for(let i =0;i<cellArrayNew[curTile].cellG.children.length;i++)
      //{
        //if(cellArrayNew[curTile].cellG.children[i].name == "eWall")
        if(cellArrayNew[curTile].ewObj !== null)
        {
          //var toGo2 = cellArrayNew[curTile].cellG.children[i];
          var toGo2 = cellArrayNew[curTile].ewObj;
          //cellArrayNew[curTile].cellG.remove(toGo2); 
          scene.remove(toGo2);     
          cellArrayNew[curTile].ewObj = null;    
          world.remove(cellArrayNew[curTile].ewCol);
          //break;
        }        
      //}
      cellArrayNew[curTile].tileTypeId -= 8;// -8 for east wall on west cell  
    }
    return;
  }
  // cell to the north
  if(dir == 1 && (nY +1) < mLength)
  {    
    if(!Visited.includes((nX*mWidth)+(nY+1)))
    {  
      cellArrayNew[curTile].tileTypeId -= 4;      

      //for(let i =0;i<cellArrayNew[curTile].cellG.children.length;i++)
     // {        
        //if(cellArrayNew[curTile].cellG.children[i].name == "nWall")
        if(cellArrayNew[curTile].nwObj !== null)
        {        
          var toGo2 = cellArrayNew[curTile].nwObj;
          scene.remove(toGo2);        
          cellArrayNew[curTile].nwObj = null;
          world.remove(cellArrayNew[curTile].nwCol);          
         // break;
        }       
      //}  

      curY += 1;
      curTile = (curX*mWidth)+curY;
      cellArrayNew[curTile].tileTypeId -= 1; 
      Visited.push(curTile);
      theStack.push(curTile);  
    }
      return;    
  }

    //cell to the east -- to the right
  if(dir == 2 && (nX +1) < mLength)
  {    
    if(!Visited.includes(((nX+1)*mWidth)+(nY)))
    {
      cellArrayNew[curTile].tileTypeId -= 8;      

      //for(let i =0;i<cellArrayNew[curTile].cellG.children.length;i++)
      //{
        //if(cellArrayNew[curTile].cellG.children[i].name == "eWall")
        if(cellArrayNew[curTile].ewObj !== null)
        {            
          //var toGo2 = cellArrayNew[curTile].cellG.children[i];
          var toGo2 = cellArrayNew[curTile].ewObj;
          //cellArrayNew[curTile].cellG.remove(toGo2);  
          scene.remove(toGo2);
          cellArrayNew[curTile].ewObj = null;
          world.remove(cellArrayNew[curTile].ewCol);            
          //break;
        }         
      //} 
      curX += 1;
      curTile = (curX*mWidth)+curY;
      cellArrayNew[curTile].tileTypeId -= 2; 
      Visited.push(curTile);
      theStack.push(curTile);   
    }
      return;
  }
    //cell to the south
  if(dir == 3 && (nY-1)>=0)
  { 
    if(!Visited.includes((nX*mWidth)+(nY-1)))
    {
      cellArrayNew[curTile].tileTypeId -= 1;

      curY -= 1;
      curTile = (curX*mWidth)+curY;       

      Visited.push(curTile);
      theStack.push(curTile);

      //for(let i =0;i<cellArrayNew[curTile].cellG.children.length;i++)
      //{
        if(cellArrayNew[curTile].nwObj !== null)
        {        
          var toGo2 = cellArrayNew[curTile].nwObj;
          scene.remove(toGo2);        
          cellArrayNew[curTile].nwObj = null;
          world.remove(cellArrayNew[curTile].nwCol);          
          //break;
        }        
      //}   
      cellArrayNew[curTile].tileTypeId -= 4; 
    }
      return;
  }  
} 



function ProbeNeighbor()
{   
  neighborCount = 0;

  const nX = Math.floor(curTile/mWidth);
  const nY = (curTile%mWidth);

  /*this isn't preventing curtiles exceeding maze dimensions from being used*/

  //checking east
  if((nX-1)>= 0)
  {    
    if(!Visited.includes(((nX-1)*mWidth)+nY))
    {
      neighborCount += 1;
    }
  }
  //checking north
  if((nY+1)<mLength)
  {    
    if(!Visited.includes((nX*mWidth)+(nY+1)))
    {
      neighborCount += 1;
    }
  }
  //checking west  
  if((nX+1)<mWidth)
  {    
    if(!Visited.includes(((nX+1)*mWidth)+nY))
    {
      neighborCount += 1;
    }
  }
  //checking south
  {
    if((nY-1)>=0)
    {      
      if(!Visited.includes((nX*mWidth)+(nY-1)))
      {
        neighborCount += 1;
      }
    }
  }  
}


function MazeLoop()
{  
  const prev = curTile;    

  ProbeNeighbor();    
  if(neighborCount>0) //can move forward
  {
    TakeAStep();
    CheckFurthestPoint();
    recSteps = 0;
  }

  if(neighborCount == 0) //recurse
  {        
    theStack.pop();    
    if(theStack.length>0)
    {
      curTile = theStack[theStack.length-1];
      curX = Math.floor(curTile/mWidth);
      curY = (curTile%mWidth);
      recSteps++;
    }
  }

  //charSphere.position.x = curX*10;
  //charSphere.position.z = (curY*10)*-1;
  

  
  if(theStack.length>0)
  {
    MazeLoop();
  }

  

  if(theStack.length == 0)
  {
    const furX = Math.floor(furthestPoint/mWidth);
    const furY = (furthestPoint%mWidth);
    //place portal here

    //sphere3.position.x = furX*10;
    //sphere3.position.z = (furY*10)*-1;
  }
};


function CarveMaze()
{  

  console.log(cellArray[curTile].children);

  /*
  while(theStack.length > 0)// guard goblins placed
		{
			MazeLoop ();
			if(theStack.length== 0)
			{
				break;
			}
    }*/
    
    
    if(theStack.length > 0)// guard goblins placed
		{
			MazeLoop ();			
    }


}


function testBuild()
{
  gltfLoader.load(
    'assets/Walls/wall11tx.glb',
    (gltf) =>
    {    
      //console.log(gltf.scenes[0].children[0])  
      const newEWall = gltf.scenes[0].children[0];
      newEWall.position.x = 10;
      newEWall.position.y = 0;
      newEWall.position.z = 0;  
      newEWall.rotation.z = Math.PI /-2;
      newEWall.scale.set(1,1,1);           
      scene.add(newEWall);
      //cellGroup.add(newEWall);  
      
      
      const shape = new CANNON.Box(new CANNON.Vec3(.48,2.5,5));  
      const body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(newEWall.position.x- 4.8,newEWall.position.y +2.5,newEWall.position.z),
      shape: shape
      // material: defaultMaterial
      });
      //body.position.copy(position);
      ///body.addEventListener('collide',playHitSound);
      world.addBody(body);  

      
      //objectsToUpdate.push({
      //mesh: mesh,
      //body: body
      //});
    }
  );
}


function testBuildInstanced()
{
  gltfLoader.load(
    'assets/Walls/wall11tx.glb',
    (gltf) =>
    {    
      /*
      //console.log(gltf.scenes[0].children[0])  
      const newEWall = gltf.scenes[0].children[0];
      newEWall.position.x = 10;
      newEWall.position.y = 0;
      newEWall.position.z = 0;  
      newEWall.rotation.z = Math.PI /-2;
      newEWall.scale.set(1,1,1);           
      scene.add(newEWall);
      //cellGroup.add(newEWall);  */

      const instancedMesh = new THREE.InstancedMesh(gltf.scenes[0].children[0].geometry, gltf.scenes[0].children[0].material, 20);
      const dummyObject = new THREE.Object3D();

      instancedMesh.position.x = 0;
      instancedMesh.position.y = 0;
		  instancedMesh.position.z = 10; 
      instancedMesh.scale.set(1,1,1);
      instancedMesh.rotation.x = Math.PI / 2;
      instancedMesh.rotation.z = Math.PI / 2;
		  instancedMesh.setMatrixAt(2, dummyObject.matrix);
      scene.add(instancedMesh);





      
      /*
      const shape = new CANNON.Box(new CANNON.Vec3(.48,2.5,5));  
      const body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(newEWall.position.x- 4.8,newEWall.position.y +2.5,newEWall.position.z),
      shape: shape
      // material: defaultMaterial
      });
      //body.position.copy(position);
      ///body.addEventListener('collide',playHitSound);
      world.addBody(body); */ 

      
      //objectsToUpdate.push({
      //mesh: mesh,
      //body: body
      //});
    }
  );
}






function BuildPlatform(xPos,zPos)
{
  
  gltfLoader.load(
    'assets/platform.gltf',
    (gltf) =>
    {
      const newObj = gltf.scene.children[0];
      newObj.position.x = xPos;
      newObj.position.y = -.2;
      newObj.position.z = zPos;  
      newObj.scale.set(14,14,14)
      scene.add(newObj);
     
      
      
      const shape = new CANNON.Box(new CANNON.Vec3(5*14,.5,5*14));  
      const body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(newObj.position.x,newObj.position.y-.5,newObj.position.z),      
      shape: shape,
      // material: defaultMaterial
      });      
      //body.position.copy(position);
      ///body.addEventListener('collide',playHitSound);
      world.addBody(body);  

      
   
    }
  );
}

BuildPlatform(45,-45);

var trapTest = null;

const fbxLoader = new FBXLoader();
let aniMixers = [];
let animsArr = [];

function BuildTrap(xPos,zPos,hRot)
{  
  fbxLoader.load(
    'assets/wallTrapAnim2.fbx',
    (object)=>
    {      
      trapTest = object;
      object.position.x = xPos;      
      object.position.y = 2.6;      
      object.position.z = zPos;
      if(hRot == 1)
      {
        object.rotation.y = Math.PI / 2;
      } 
      scene.add(object);
      

    mixer = new THREE.AnimationMixer(object);
    aniMixers.push(mixer);
    animTest = mixer.clipAction(object.animations[0]);
    
    animsArr.push(animTest);
    animTest.setLoop(THREE.LoopOnce);
    animTest.clampWhenFinished = true;
    animTest.enable = true;

      
    const body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(object.children[1].position.x,object.children[1].position.y,object.children[1].position.z),
      shape: clapTrapShape
      // material: defaultMaterial
    }); 
    body.collisionResponse = 0;
    body.addEventListener("collide", function(e){
       console.log(e);
       window.location.reload();
      }); 
    world.addBody(body);

    
    trapsToUpdate.push({
      mesh: object.children[1],
      body: body
    });

    const body2 = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(object.children[0].position.x,object.children[0].position.y,object.children[0].position.z),
      shape: clapTrapShape
      // material: defaultMaterial
    }); 
    body2.collisionResponse = 0;
    body2.addEventListener("collide", function(e){
      console.log(e); 
      window.location.reload();
     });     
    world.addBody(body2);

    
    trapsToUpdate.push({
      mesh: object.children[0],
      body: body2
    });





    }
  );
}

function FireTrap(objAnim)
{
  objAnim.reset();      
  objAnim.play();
  const inter = (Math.floor((Math.random() * 4))+1)*1000;
  setTimeout(function() { FireTrap(objAnim)}, inter);
}
  
function FireTraps()
{
  for(const ani of animsArr)
  {
    ani.reset();      
    ani.play();
    const inter = (Math.floor((Math.random() * 4))+1)*1000;
    setTimeout(function() { FireTrap(ani)}, inter);
  } 
}



//testBuild();

//testBuildInstanced();




RawMazeBuild();

//BuildTrap(1,1,1);

//BuildTile(1,10);



function PlaceMazeTraps()
{
  for(let row = 0;row<mWidth;row++)
  {
    for(let column = 0;column<mLength;column++)
    {
      const tileNum = (row*mWidth)+column;
      //console.log(tileNum, cellArrayNew[tileNum].tileTypeId);

      if(cellArrayNew[tileNum].tileTypeId == 10 || cellArrayNew[tileNum].tileTypeId == 5)// if north south or east west hall
      {       
        console.log(cellArrayNew[tileNum].tileTypeId );
        const randChance = Math.floor((Math.random() * 9));

        if(randChance>5)
        {
          if(cellArrayNew[tileNum].tileTypeId == 5)
          {            
            BuildTrap(row*mWidth,(column*10)*-1,0);
          }         
          if(cellArrayNew[tileNum].tileTypeId == 10)
          {            
           BuildTrap(row*mWidth,(column*10)*-1,1);
          }          
        }
    }



    }
  }


}




document.addEventListener('keydown', function(e){
  if(e.key === 'm')
  {
    //FireTrap(animsArr[0]);
    FireTraps();

    //animsArr[0].reset();      
    //animsArr[0].play();
    //setTimeout(function() { console.log(animsArr[0])}, 5000);
    
  }  
});



////this is where the player will be created
const charSphere = new THREE.Mesh(
  new THREE.SphereBufferGeometry(1,16,16),
 baseMat2);
 charSphere.castShadow = true;
//sphere2.scale.set(1.2,2,1);
charSphere.position.y = 2;
charSphere.position.x = 10;
charSphere.position.z = 20;
scene.add(charSphere);

const charShape = new CANNON.Sphere(1);   
  const charBody = new CANNON.Body({
    mass: 1,    
    position: new CANNON.Vec3(0,0,0),
    shape: charShape,
    //material: defaultMaterial
  });
  
  charBody.fixedRotation = true;
  charBody.angularDamping = 1;


  charBody.position.copy(charSphere.position);  
  world.addBody(charBody);  

  objectsToUpdate.push({
    mesh: charSphere,
    body: charBody
  });

  const camSpot = new THREE.Mesh(
    new THREE.SphereBufferGeometry(.2,4,4),
   baseMat2);
  camSpot.castShadow = true;
  //camSpot.scale.set(1,1,2);
  camSpot.position.y = 5.7;//5.7
  camSpot.position.x = 0;
  camSpot.position.z = 6;//5
  camSpot.rotateX((Math.PI/180)*-10);//-25
  camSpot.visible = false;
  scene.add(camSpot);
  camSpot.parent = charSphere;


//// the portal
/*
const sphere3 = new THREE.Mesh(
  new THREE.SphereBufferGeometry(2,16,16),
 baseMat);
sphere3.castShadow = true;
sphere3.position.y = 2;
sphere3.position.x = 10;
sphere3.position.z = 0;
scene.add(sphere3);*/







let maxSpeed = .3,minSpeed = -.2,speed = 0,acceler = .2,turnAccel = 4,angle = 0;
//let maxSide = .3,minSide =-.4,sideSpeed = 0,sideAccel = .4;

let moving = 0,turning = 0;


//arow keys
document.onkeydown = (event) => 
{
  switch(event.key)
  {
    case "ArrowLeft":
    //sideSpeed -= sideAccel;
    turning = -1;
    break;

    case "ArrowRight":
      //sideSpeed += sideAccel;
      turning = 1;
    break;

    case "ArrowUp":      
      //
      moving = 1;
    break;

    case "ArrowDown":      
      //speed -= acceler;
      moving = -1;
    break;
  }
}

document.onkeyup = (event) => 
{
  switch(event.key)
  {
    case "ArrowLeft":
    //sideSpeed = 0;
    turning = 0;
    break;

    case "ArrowRight":
      //sideSpeed = 0;
      turning = 0;
    break;

    case "ArrowUp":      
      speed = 0;
      moving = 0;
    break;

    case "ArrowDown":      
      speed = 0;
      moving = 0;
    break;
  }
}




function moveChar()
{

  if(turning>0)
  {
    angle -= (Math.PI/180)*turnAccel;
    charBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0),angle);
  }

  if(turning<0)
  {
    angle += (Math.PI/180)*turnAccel;
    charBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0),angle);
  }
  

  if(moving>0)//forward
  {
    speed += acceler;
    if(speed> maxSpeed)
    {
      speed = maxSpeed;
    } 
  }

  if(moving<0)// backward
  {
    speed -= acceler;
    if(speed < minSpeed)
    {
      speed = minSpeed;
    }
  }

 
  /*
  if(sideSpeed>maxSide)
  {
    sideSpeed= maxSide;
  }
  if(sideSpeed<minSide)
  {
    sideSpeed = minSide;
  }*/

  
  charBody.position.x += speed * Math.sin(-angle);
  charBody.position.z -= speed * Math.cos(-angle);

  //charBody.position.x += sideSpeed * Math.cos(angle);
  //charBody.position.z -= sideSpeed * Math.sin(angle);

}

function lerp (start, end, amt)
{
  return (1-amt)*start+amt*end;
}





let adj = .1;
var target = new THREE.Vector3();
let tarQuat = new THREE.Quaternion();
let lerQuat = new THREE.Quaternion();

//cam spot is 5.7 up and -5 back, rotated 25 down x

function UpdateCam()
{      
  camSpot.getWorldPosition(target);
  camSpot.getWorldQuaternion(tarQuat);
  
  /*
  camera.position.x = target.x;
  camera.position.y = target.y;
  camera.position.z = target.z;*/

  camera.position.x = lerp(camera.position.x,target.x,adj);
  camera.position.y = lerp(camera.position.y,target.y,adj);
  camera.position.z = lerp(camera.position.z,target.z,adj);

 
  /*
  tarQuat = sphere2.quaternion;
  tarQuat.x = -.25;
  

  camera.quaternion.set(tarQuat);*/
  
 //console.log(sphere2.getWorldDirection)

  
  //lerQuat = new THREE.Quaternion(lerp(camera.quaternion.x,tarQuat.x,adj),lerp(camera.quaternion.y,tarQuat.y,adj),lerp(camera.quaternion.z,tarQuat.z,adj),lerp(camera.quaternion.w,tarQuat.w,adj));


  //camera.quaternion.copy(lerQuat);

  camera.quaternion.slerp(tarQuat,adj);



  //camera.lookAt(sphere2.position);
  //camera.rotateX((Math.PI/180)*25);
 
  
}




//setTimeout(function() {CarveMaze()}, 5000);

document.addEventListener('keydown', function(e){
  if(e.key === 'w')
  {    
    CarveExit();
    MazeLoop();
    //ProbeNeighbor();
    //console.log("curTile",curTile);
    //console.log("neighborCount",neighborCount);
    //console.log("stackLength", theStack.length);
    //console.log("vistedLength", Visited.length);
    

    //charSphere.position.x = curX*10;
    //charSphere.position.z = 20;

  }  
});


document.addEventListener('keydown', function(e){
  if(e.key === 'p')
  {
    //console.log(cellArray);
    PlaceMazeTraps();
    //console.log(cellArrayNew);
  }  
});

document.addEventListener('keydown', function(e){
  if(e.key === 'v')
  {
    console.log(Visited);
  }  
});

document.addEventListener('keydown', function(e){
  if(e.key === 't')
  {
    console.log(renderer.info);
  }  
});




//setTimeout(function() { testWallRemove()}, 5000);






//raycaster
const mouse = new THREE.Vector2();

const raycaster = new THREE.Raycaster();
//raycaster

/*
const craft = new THREE.Mesh(new THREE.BoxBufferGeometry(.2,.2,.8), craftMat);
craft.position.z = 1;
scene.add(craft);*/


/*
const flyControls = new FlyControls(craft,canvas);
flyControls.movementSpeed = .6;
flyControls.domElement = document.querySelector('canvas.webgl');
//flyControls.rollSpeed = Math.PI / 24;
flyControls.autoForward = false;
flyControls.dragToLook = true;*/


/*
const sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(.5,16,16), baseMat);
sphere.castShadow = true;
sphere.scale.set(1,.4,1);
sphere.position.y = .5;
//sphere.geometry.computeBoundingSphere();
scene.add(sphere);
controls.target.set(sphere.position.x,sphere.position.y,sphere.position.z);

//camera.lookAt(sphere.position);


const sphere2 = new THREE.Mesh(new THREE.SphereBufferGeometry(.5,16,16), baseMat2);
sphere2.castShadow = true;
sphere2.position.y = 4;
sphere2.position.x = -7;
sphere2.position.z = -12;
//sphere2.geometry.computeBoundingSphere();
sphere2.scale.set(1,.4,1);

scene.add(sphere2);

const sphere3 = new THREE.Mesh(new THREE.SphereBufferGeometry(.5,16,16), baseMat3);
sphere3.castShadow = true;
sphere3.position.y = 8;
sphere3.position.x = 8;
sphere3.position.z = -4;
sphere3.scale.set(1,.4,1);
//sphere3.geometry.computeBoundingSphere();
scene.add(sphere3);*/




window.addEventListener('dblclick', (event) =>{

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  mouse.x = ( x / canvas.clientWidth ) *  2 - 1;
  mouse.y = ( y / canvas.clientHeight) * - 2 + 1;


  //mouse.x = event.clientX/sizes.width*2-1,
  //mouse.y = (event.clientY/sizes.height)*2-1,
  
  //camera.updateProjectionMatrix();

  raycaster.setFromCamera(mouse, camera);


  const objectsToTest = [sphere,sphere2,sphere3];
  const intersects = raycaster.intersectObjects(objectsToTest);

  for(const object of objectsToTest)
  {
    //object.material.color.set('#ff0000');
  };
  for(const intersect of intersects)
  {    
    //intersect.object.material.color.set('#0000ff');
    const retVec = new THREE.Vector3().subVectors(camera.position, intersect.object.position).normalize().multiplyScalar(2);
       

    const newCamPos = new THREE.Vector3().addVectors(intersect.object.position,retVec);
    //camera.position.x = newCamPos.x;
    //camera.position.y = intersect.object.position.y;
    //camera.position.z = newCamPos.z;
    //controls.target.set(intersect.object.position.x,intersect.object.position.y,intersect.object.position.z);    
    //break;

    newCamPos.y = intersect.object.position.y;

    controls.target.set(intersect.object.position.x,intersect.object.position.y,intersect.object.position.z);  
    gsap.to(camera.position, {duration:1,x:newCamPos.x,y:newCamPos.y,z:newCamPos.z});


    //camera.position.x = newCamPos.x;
    //camera.position.y = newCamPos.y;
    //camera.position.z = newCamPos.z;
    
    
    
    break;
  };  
});


////Mine==================================================================





////lights==================================================================
const ambientLight = new THREE.AmbientLight(0xffffff,0.5);//.5
scene.add(ambientLight);

const pointLight = new THREE.DirectionalLight(0xffffff,.8);//.8
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.camera.far = 50;

scene.add(pointLight);



const dirLight = new THREE.DirectionalLight(0xffffff,.5);//.5
dirLight.position.x = 4;
dirLight.position.y = 3;
dirLight.position.z = -5;
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.far = 50;

scene.add(dirLight);



////lights==================================================================





/*
//debug
dGui.add(cube.position,"y",-3,3,0.01);
dGui.add(cube.position,"x").max(3).step(0.01).min(-3);
dGui.addColor(cubeColor,"color").onChange(()=>{
  material.color.set(cubeColor.color);
})*/

//cube.position.z = -5;
//cube.rotation.x = 10;
//cube.rotation.y = 5;

//renderer.render(scene,camera);

//camera.lookAt(cube.position);


////greensock animations //don't need to run in the game loop
//gsap.to(cube.position, {duration:1,delay:1,x:2});
////greensock animations








////for delta time
//let oTime = Date.now();
const clock = new THREE.Clock();
let oldElapsedTime = 0;

let trapTar = new THREE.Vector3();
let trapQuat = new THREE.Quaternion();


////main game loop==================================================================
const gameLoop = () =>
{  
  

  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - oldElapsedTime;
  oldElapsedTime = elapsedTime;


  //sphereBody.applyForce(new CANNON.Vec3(-0.5,0,0), sphereBody.position);

  




  //update physics world
  world.step(1/60,deltaTime,3);

  if(aniMixers.length>0)
  {
    for(const mix of aniMixers)
    {
      mix.update(deltaTime);
    }
  }

  //cannonDebugger.update();

  moveChar();
  
  for(const object of objectsToUpdate)
  {
    object.mesh.position.copy(object.body.position);
    object.mesh.quaternion.copy(object.body.quaternion);
  }

  for(const trap of trapsToUpdate)
  {    
    trap.body.position.copy(trap.mesh.getWorldPosition(trapTar));
    trap.body.quaternion.copy(trap.mesh.getWorldQuaternion(tarQuat));                  
  }


 UpdateCam();

  
 
  stats.update();


  //update physics world


  /*
  ////update particles
  for(let i = 0;i<count;i++)
  {
    

    const i3 = i*3;
    particlesGeometry.attributes.position.array[i3] = Math.sin(elapsedTime);
  };

  particlesGeometry.attributes.position.needsUpdate = true;*/



  /*
  camera.position.x = Math.sin(cursor.x * Math.PI*2)*3;
  camera.position.z = Math.cos(cursor.x * Math.PI*2)*3;
  camera.position.y = cursor.y *5;
  camera.lookAt(cube.position);*/

  
  
  //delta time calc
  /*
  const curTime = Date.now();
  const deltaTime = curTime-oTime;
  oTime = curTime;*/

 
  //sphere.rotation.y = 0.1*elapsedTime;
  //plane.rotation.y = 0.1*elapsedTime;
  //torus.rotation.y = 0.1*elapsedTime;

  //cube.rotation.y += .001 * deltaTime;

  /*
  const elapsedTime = clock.getElapsedTime();
  cube.position.y = Math.sin(elapsedTime);*/

  //controls.update(); 
  
  //flyControls.update(deltaTime);

  //stats.begin();

  renderer.render(scene,camera); 

  //stats.end();

  requestAnimationFrame(gameLoop);  
}

//call it once to kick off the loop
gameLoop();
////main game loop==================================================================

/*
var animate = function(){
    //group.rotation.y += 0.01;        
    requestAnimationFrame(animate);
    renderer.render(scene,camera);   
  }

  animate();*/




































////Physics==================================================================
/*
//utils

//sounds
const hitSound = new Audio('assets/sounds/button-press.ogg');
playHitSound = (collision) =>
{ 
  const impactStrength = collision.contact.getImpactVelocityAlongNormal();

  if(impactStrength > 1)
  {
    hitSound.volume = impactStrength/10;
    hitSound.currentTime = 0;
    hitSound.play();
  }
};
//sounds


const objectsToUpdate = [];

const debugObject = {};
debugObject.createSphere = () =>
{
  createSphere(
    Math.random() *.5,
    {
      x: (Math.random()-.5)*3,
      y:3,
      z: (Math.random()-.5)*3
    });
};

debugObject.createBox = () =>
{
  createBox(
    Math.random()*2,
    Math.random()*2,
    Math.random()*2,
    {
      x:(Math.random()-.5)*3,
      y:3,
      z:(Math.random()-.5)*3
    }
  );
};

debugObject.reset = () =>
{
  for(const object of objectsToUpdate)
  {
    object.body.removeEventListener('collide', playHitSound);
    world.removeBody(object.body);
    scene.remove(object.mesh);
  }
};


dGui.add(debugObject,'createSphere');
dGui.add(debugObject,'createBox');
dGui.add(debugObject,'reset');


const sphereGeometry = new THREE.SphereBufferGeometry(1,20,20);
const genBox = new THREE.BoxBufferGeometry(1,1,1);

const sphereMaterial = new THREE.MeshStandardMaterial({
  metalness: .3,
  roughness: .4      
});

const createSphere = (radius, position) =>
{
  const mesh = new THREE.Mesh(sphereGeometry,    
    sphereMaterial
  );

  mesh.castShadow = true;
  mesh.scale.set(radius,radius,radius);
  mesh.position.copy(position);
  scene.add(mesh);

  const shape = new CANNON.Sphere(radius);   
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0,0,0),
    shape: shape,
    material: defaultMaterial
  });
  body.position.copy(position);  
  world.addBody(body);  

  objectsToUpdate.push({
    mesh: mesh,
    body: body
  });
};

const createBox = (width,height,depth,position) =>
{
  const mesh = new THREE.Mesh(genBox,    
    sphereMaterial
  );
  mesh.castShadow = true;
  mesh.scale.set(width,height,depth);
  mesh.position.copy(position);
  scene.add(mesh); 

  const shape = new CANNON.Box(new CANNON.Vec3(width/2,height/2,depth/2));   
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0,0,0),
    shape: shape,
    material: defaultMaterial
  });
  body.position.copy(position);
  body.addEventListener('collide',playHitSound);
  world.addBody(body);  

  objectsToUpdate.push({
    mesh: mesh,
    body: body
  });
};
//utils



const world = new CANNON.World();
world.broadPhase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
world.gravity.set(0,-9.82,0);


//const concreteMaterial = new CANNON.Material('concrete');
//const plasticMaterial = new CANNON.Material('plastic');


const defaultMaterial = new CANNON.Material('default');


//const concretePlasticContactMaterial = new CANNON.ContactMaterial(
  //concreteMaterial,
  //plasticMaterial,
  //{
   // friction: 0.1,
   // restitution: 0.7
 // }
//);

const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial, 
  defaultMaterial, 
  {
    friction: 0.1,
    restitution: 0.7
  }
);


world.addContactMaterial(defaultContactMaterial);


/*
const sphereShape = new CANNON.Sphere(.5);
const sphereBody = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(0,3,0),
  shape: sphereShape,
  material: defaultMaterial
});

//world.defaultContactMaterial = defaultContactMaterial;

sphereBody.applyLocalForce(new CANNON.Vec3(150,0,0), new CANNON.Vec3(0,0,0));
world.addBody(sphereBody);*/

/*
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.mass = 0;
floorBody.addShape(floorShape);
floorBody.material = defaultMaterial;
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1,0,0), Math.PI * .50);
world.addBody(floorBody);



const testMat = new THREE.MeshMatcapMaterial();
testMat.matcap = matCapTexture;
const groundMat = new THREE.MeshStandardMaterial();
*/
//createSphere(0.5,{x:0,y:3,z:0});




/*
const sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(.5,16,16), testMat);
sphere.castShadow = true;
sphere.position.y = .5;
scene.add(sphere);*/


/*
const plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(10,10), groundMat);
plane.receiveShadow = true;
scene.add(plane);
plane.position.y = 0;
plane.rotation.x = Math.PI * -.5;
*/
////Physics==================================================================




////importing models==================================================================
/*
const gltfLoader = new GLTFLoader();

gltfLoader.load(
  'assets/models/FlightHelmet/glTF/FlightHelmet.gltf',
  (gltf) =>
  {
    //scene.add(gltf.scene.children[0]);
    /*
    while(gltf.scene.children.length)
    {
      scene.add(gltf.scene.children[0]);
    }*/

    /*
    const children = [...gltf.scene.children];
    
    for(let i = 0;i<children.length;i++)
    {    
      children[i].scale.set(5,5,5);     
      scene.add(children[i])
    }*
    
    //console.log(gltf.scene);

     //scene.add(gltf.scene);
  }
);

const floor = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(10,10),
  new THREE.MeshStandardMaterial({
    color: '#444444',
    metalness:0,
    roughness: 0.5
  })
);
scene.add(floor);
floor.position.y = 0;
floor.rotation.x = Math.PI * -.5;
*/
////importing models==================================================================







/*
////cursor==================================================================
const cursor = {x:0,y:0};

window.addEventListener('mousemove',(event)=>{
  cursor.x = event.clientX/sizes.width - 0.5;
  cursor.y = event.clientY/sizes.height - 0.5; 
});*/
////cursor==================================================================




////to go and leave full screen==================================================================
/*
window.addEventListener('dblclick', ()=>
{
  const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;

  if(!fullscreenElement)
  {
    if(canvas.requestFullscreen)
    {
      canvas.requestFullscreen();
    }
    else if(canvas.webkitRequestFullscreen)
    {
      canvas.webkitRequestFullscreen();
    }   
  }
  else
  {
    if(document.exitFullscreen)
    {
      document.exitFullscreen();
    }
    else if(document.webkitExitFullscreen)
    {
      document.webkitExitFullscreen();
    }
  }
});*/
////full screen==================================================================




////groups==================================================================
/*
const group = new THREE.Group();
scene.add(group);

const cube1 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({color:0xff0000}));
group.add(cube1);

const cube2 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({color:0x00ff00}));
group.add(cube2);

cube2.position.x = -2;

const cube3 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({color:0x0000ff}));
group.add(cube3);

cube3.position.x = 2;

group.position.z = -5;*/
////groups==================================================================



////textures==================================================================
/*
const cubeColor = {color:0xff0000};
const image = new Image();
image.src = "assets/door/color.jpg";
const texture = new THREE.Texture(image);
image.onload = () =>
{
  texture.needsUpdate = true;
};*/
////textures==================================================================



////materials==================================================================
//const testMat = new THREE.MeshBasicMaterial({map: matCapTexture});
//const testMat = new THREE.MeshBasicMaterial();
//testMat.transparent = true;
//testMat.alphaMap = alphaTexture;

/*
const testMat = new THREE.MeshMatcapMaterial();
testMat.matcap = matCapTexture;*/


/*
const testMat = new THREE.MeshStandardMaterial();
testMat.roughness = .5;

dGui.add(testMat, "metalness").max(1).step(0.01).min(-1);
dGui.add(testMat, "roughness").max(1).step(0.01).min(0);


const groundMat = new THREE.MeshStandardMaterial();
groundMat.map = matCapTexture;
*/
////materials==================================================================




////fonts==================================================================
/*
const fontLoader = new FontLoader();
fontLoader.load(
  'assets/fonts/helvetiker_regular.typeface.json',
  (font) =>
  {
    const textGeometry = new TextGeometry(
      'Hello Three js',
      {
        font: font,
        size: 0.5,
        height:0.2,
        curveSegments: 4,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 3
      }
    )

    /*
    textGeometry.computeBoundingBox();
    textGeometry.translate(
      textGeometry.boundingBox.max.x *-0.5,
      textGeometry.boundingBox.max.y *-0.5,
      textGeometry.boundingBox.max.z *-0.5
    );*/

      /*
    textGeometry.center();


    const textMaterial = new THREE.MeshBasicMaterial();
    const text = new THREE.Mesh(textGeometry,testMat);
    scene.add(text);


    const donutGeo = new THREE.TorusBufferGeometry(.3,.2,20,45);

    
    for(let i = 0;i<100;i++)
    {
      
      const donut = new THREE.Mesh(donutGeo,testMat);
      donut.position.x = (Math.random() -.5)*10;
      donut.position.y = (Math.random() -.5)*10;
      donut.position.z = (Math.random() -.5)*10;

      /*
      donut.rotation.x = Math.random()*Math.PI;
      donut.rotation.y = Math.random()*Math.PI;*/

      /*
      donut.lookAt(0,0,0);

      const dist = donut.position.distanceTo(text.position)/4;      

      //const scaleVal = Math.random();
      const scaleVal = dist;
      donut.scale.set(scaleVal,scaleVal,scaleVal);


      scene.add(donut);
    }    
  }
);*/
////fonts==================================================================





/*
const geometry = new THREE.BoxBufferGeometry(1,1,1);
const material = new THREE.MeshBasicMaterial({color: cubeColor});
const cube = new THREE.Mesh(geometry,material);
scene.add(cube);*/




//const sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(.5,16,16), testMat);
//sphere.castShadow = true;
//const plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(1,1), testMat);
//const torus = new THREE.Mesh(new THREE.TorusBufferGeometry(0.3,0.2,16,32), testMat);







////haunted house example==================================================================
/*
const fog = new THREE.Fog('#ff0000',6,12);
scene.fog = fog;

const house = new THREE.Group();
scene.add(house);

const houseBox = new THREE.Mesh(
  new THREE.BoxBufferGeometry(4,2.5,4),
  new THREE.MeshStandardMaterial({color:'#ac8e82'})
);
houseBox.position.y = 1.25;
house.add(houseBox);

const roof = new THREE.Mesh(
  new THREE.ConeBufferGeometry(3.5,1,4),
  new THREE.MeshStandardMaterial({color:'#b35f45'})
);
roof.position.y = 3;
roof.rotation.y = Math.PI*.25;
house.add(roof);

const bushGeometry = new THREE.SphereBufferGeometry(1,16,16);
const bushMaterial = new THREE.MeshStandardMaterial({color:'#89c854'});

const bush1 =  new THREE.Mesh(bushGeometry,bushMaterial);
house.add(bush1);

const grassTexture = textureLoader.load('assets/grass/color.jpg');

const groundPlane = new THREE.Mesh(new THREE.PlaneBufferGeometry(30,30),
new THREE.MeshStandardMaterial({color:'#a9c388', map:grassTexture})
);
groundPlane.receiveShadow = true;
scene.add(groundPlane);

//torus.position.x = 1.5;
//sphere.position.x = -1.5;
groundPlane.rotation.x = Math.PI * -.5;

camera.lookAt(house.position);
*/
////haunted house example==================================================================





////particles==================================================================
/*
const particlesGeometry = new THREE.SphereBufferGeometry(1,32,32);
const particlesMaterial = new THREE.PointsMaterial(
  {
    size: 0.02,
    sizeAttenuation: true
  }
);


//points
const particles = new THREE.Points(particlesGeometry,particlesMaterial);
scene.add(particles);*/
/*
const particleTexture = textureLoader.load('assets/particles/2.png');

const particlesGeometry = new THREE.BufferGeometry()
const count = 50000;

const positions = new Float32Array(count *3);
const colors = new Float32Array(count*3);

for (let i = 0;i<count*3;i++)
{
  positions[i] = (Math.random() - .5) * 10;
  colors[i] = Math.random();
}

particlesGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(positions,3)
);
particlesGeometry.setAttribute(
  'color',
  new THREE.BufferAttribute(colors,3)
);


const particlesMaterial = new THREE.PointsMaterial();
particlesMaterial.size = 0.1;
particlesMaterial.sizeAttenuation = true;
particlesMaterial.color = new THREE.Color('#ff88cc');
particlesMaterial.transparent = true;
particlesMaterial.alphaMap = particleTexture;
//particlesMaterial.depthTest = false;
particlesMaterial.depthWrite = false;
particlesMaterial.blending = THREE.AdditiveBlending;
particlesMaterial.vertexColors = true;

const particles = new THREE.Points(particlesGeometry,particlesMaterial)
scene.add(particles);*/
////particles==================================================================









////Galaxy==================================================================
/*
const parameters = {};
parameters.count = 1000;
parameters.size = 0.02;
parameters.radius = 3;
parameters.branches = 3;
parameters.spin = 1;
parameters.randomness = .2;
parameters.randomnessPower = 3;

let geometry = null;
let points = null;
let material = null;

const generateGalaxy = () =>
{
  if(geometry !== null)
  {
    geometry.dispose();
  };
  if(points !== null)
  {
    scene.remove(points);
  };
  if(material !== null)
  {
    material.dispose();
  };


  geometry = new THREE.BufferGeometry();
  let positions = new Float32Array(parameters.count *3);

  for(let i = 0;i<parameters.count;i++)
  {
    const i3 = i*3;

    const radius = Math.random() * parameters.radius;
    const spinAngle = radius * parameters.spin;
    const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI *2;

    const curvePow = Math.pow(.1,6);

    
    const randomX = Math.pow(Math.random(),parameters.randomnessPower) * (Math.random() <.5 ? 1: -1);
    const randomY = Math.pow(Math.random(),parameters.randomnessPower) * (Math.random() <.5 ? 1: -1);
    const randomZ = Math.pow(Math.random(),parameters.randomnessPower) * (Math.random() <.5 ? 1: -1);



    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3+1] = randomY;
    positions[i3+2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
  }

  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions,3)
  );

  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttribute: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    color: '#ff5588'
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);
};

generateGalaxy();

dGui.add(parameters,'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy);
dGui.add(parameters,'size').min(.001).max(.1).step(.001).onFinishChange(generateGalaxy);
dGui.add(parameters,'radius').min(.01).max(20).step(.01).onFinishChange(generateGalaxy);
dGui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy);
dGui.add(parameters, 'spin').min(-5).max(5).step(.001).onFinishChange(generateGalaxy);
dGui.add(parameters, 'randomness').min(0).max(2).step(.001).onFinishChange(generateGalaxy);
dGui.add(parameters, 'randomnessPower').min(1).max(10).step(.001).onFinishChange(generateGalaxy);
*/
////Galaxy================================================================== 




