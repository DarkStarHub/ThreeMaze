
////imports=======================================================
////greensock import
const gsap = window.gsap;
////dat.gui import
const datG = window.dat.gui;

const sizes = {width:window.innerWidth,height:window.innerHeight};

const dGui = new dat.GUI();
////imports=======================================================





////create scene==================================================================
const scene = new THREE.Scene();
////create scene==================================================================



////Axes helper==================================================================
//const axesHelper = new THREE.AxesHelper();
//scene.add(axesHelper);
////axes helper==================================================================



////create camera==================================================================
//const camera = new THREE.PerspectiveCamera( 75,window.innerWidth/window.innerHeight);
const camera = new THREE.PerspectiveCamera( 60,sizes.width/sizes.height);
camera.position.z = 20; //5
camera.position.x = 10; //0
camera.position.y = 15; //5.7

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
////for stats
stats = createStats();
document.body.appendChild( stats.domElement );





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
  let loadString = 'assets/Walls/wall111.glb';
  switch(num)
  {    
    case 0:    
    loadString = 'assets/Walls/wall111.glb'
    break;
  
    case 1:      
    loadString = 'assets/Walls/wall222.glb'
    break;

    case 2:     
    loadString = 'assets/Walls/wall333.glb'  
    break;

    case 3:      
    loadString = 'assets/Walls/wall444.glb' 
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

function BuildTileNoMaze(xPos,zPos)
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
                     
      
      const body = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(newTile.position.x,newTile.position.y-.5,newTile.position.z),      
      shape: tileShape,      
      });      
     
      world.addBody(body);   
    }
  );
}






function BuildEWallInstanced(xPos,zPos,incCellObj,dummyObj)
{  

  //for instancing
      dummyObj.position.set(xPos*10+4.8, 0, (zPos*10)*-1);
      dummyObj.rotation.x = Math.PI / 2;
      dummyObj.rotation.z = Math.PI / 2;
      dummyObj.updateMatrix();
      instancedEMesh.setMatrixAt(xPos*mWidth+zPos, dummyObj.matrix);      
  //for instancing
  //


  //let loadString = RetLoadString();
 
  //gltfLoader.load(
    //loadString,
    //'assets/eWall.gltf',
    //(gltf) =>
    //{
      /*
      const newWall = gltf.scenes[0].children[0];
      //newWall.position.x = xPos*10;
      newWall.position.x = xPos*10 +4.8;
      newWall.position.y = 0;
      newWall.position.z = (zPos*10)*-1; 
      newWall.rotation.z = Math.PI / 2;
      newWall.scale.set(1,1,1);            
      scene.add(newWall);*/
      

     // const instancedMesh = new THREE.InstancedMesh(gltf.scenes[0].children[0].geometry, gltf.scenes[0].children[0].material, xPos*mWidth+zPos);
      
      //dummyObj.position.set(xPos*10 +4.8, 0, (zPos*10)*-1);
      
      
      //dummyObj.updateMatrix();

      //instancedMesh.position.x = xPos*10 +4.8;
      //instancedMesh.position.y = 0;
		  //instancedMesh.position.z = (zPos*10)*-1; 
      //instancedMesh.scale.set(1,1,1);
      //instancedMesh.rotation.x = Math.PI / 2;
      //instancedMesh.rotation.z = Math.PI / 2;
      //instancedMesh.setMatrixAt(xPos*10 + zPos, dummyObj.matrix);
      //instancedMesh.instanceMatrix.needsUpdate = true;
      //scene.add(instancedMesh);


      /*
      let instancedMesh = new THREE.InstancedMesh
      instancedMesh.position.x = xPos*10 +4.8;
      instancedMesh.position.y = 0;
			instancedMesh.position.z = (zPos*10)*-1; 
			instancedMesh.setMatrixAt(0, dummy.matrix);
			scene.add(instancedMesh);
			instancedMesh.scale.set(1,1,1);
			instancedMesh.rotation.y = Math.PI / 2;*/



      //incCellGroup.add(newEWall); 
      incCellObj.ewObj = instancedEMesh;
      //incCellObj.cellG.add(newWall);
      
      //const EWshape = new CANNON.Box(new CANNON.Vec3(.48,2.5,5));  
      const body = new CANNON.Body({
      mass: 0,
      //position: new CANNON.Vec3(newWall.position.x+ 4.8,newWall.position.y +2.5,newWall.position.z),
     
      position: new CANNON.Vec3(xPos*10+4.8,instancedEMesh.position.y +2.5,(zPos*10)*-1),
      shape: EWshape,
      // material: defaultMaterial
      });
      //body.position.copy(position);
      ///body.addEventListener('collide',playHitSound);
      world.addBody(body); 
      incCellObj.ewCol = body;    
}
 

const dummyObj = new THREE.Object3D();//new for instancing
var instancedEMesh = null;
  
function CreateEInstance()
{
  gltfLoader.load(    
    'assets/Walls/wall11tx.glb',
    (gltf) =>
    {      
      instancedEMesh = new THREE.InstancedMesh(gltf.scenes[0].children[0].geometry, gltf.scenes[0].children[0].material, 200);      
      scene.add(instancedEMesh);        
      RawMazeBuild();  
    });
}





//const api = {count: 200};




////different order
//instances
//const dummyObj = new THREE.Object3D();//new for instancing
var instancedPost = null;
  
function CreatePostInstance()
{
  gltfLoader.load(    
    'assets/pillar.glb',
    (gltf) =>
    {      
      instancedPost = new THREE.InstancedMesh(gltf.scenes[0].children[0].geometry, gltf.scenes[0].children[0].material, 150);      
      scene.add(instancedPost);     
      CalculateMaze();   
    });    
}

function AddPostInstance(xPos,zPos)
{ 
  //for instancing
      dummyObj.position.set((xPos*10)-5.1, 0, ((zPos*10)-5.1)*-1); 
      dummyObj.rotation.x = Math.PI / 2;
      dummyObj.updateMatrix();
      instancedPost.setMatrixAt((xPos*mWidth)+zPos, dummyObj.matrix);      
  //for instancing
}
//instances



const wallMat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    metalness:0,
    roughness: 0.8,    
  });

const colorParam = {color: '#ffffff'};
dGui.addColor(colorParam,"color").onChange(()=>
{
  wallMat.color.set(colorParam.color);
});

//this will call calcLoop 
function CalculateMaze()
{    
  curTile = (curX*mWidth)+curY;   
  for(let row = 0; row<mWidth; row++)
  {
    for(let column = 0; column<mLength; column++)
    { 
      let colObj = {
        //cellG: cellGroup,
        tileObj: 1,
        nwObj: 1,
        ewObj: 1,
        tileCol: null,
        nwCol: null,
        ewCol: null,
        tileTypeId: 15,
        tileOccupantId: 0
      };      
      cellArrayNew.push(colObj);
    }    
  } 
   Visited.push(curTile);
   theStack.push(curTile);   
   

  CalcLoop();
}
//calls popwalls
function CalcLoop()
{
  const prev = curTile;    

  CalcProbeNeighbor();    
  if(neighborCount>0) //can move forward
  {
    CalcTakeAStep();
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
    CalcLoop();
    return;
  }
  if(theStack.length == 0)
  {
    const furX = Math.floor(furthestPoint/mWidth);
    const furY = (furthestPoint%mWidth);

    const endCellFacing = cellArrayNew[furX*mWidth+furY].tileTypeId;    
    
    //place portal here
    BuildPortal(furX,furY,endCellFacing);
    /*
    gltfLoader.load(
      'assets/portal2.glb',
      (gltf) =>
      {
        const newPortal = gltf.scenes[0].children[0];
        
       
        newPortal.position.x = furX*10;
        newPortal.position.y = 0;
        newPortal.position.z = (furY*10)*-1;

        
        
        //newPortal.position.x = 10;
        //newPortal.position.y = 0;
        //newPortal.position.z = 0;


        newPortal.scale.set(.7,.7,.7);

        //create anchor for portal center
        const centObj = new THREE.Object3D();
        //centObj.position.copy(newPortal.position);
        centObj.position.y = -1;        
        centObj.position.z = -2.5;
        centObj.parent = newPortal;
      

        
        switch(endCellFacing)
        {
          case 14: // south open
          
          break;

          case 13://west open
          newPortal.rotation.z = Math.PI / 2; 
          break;

          case 11:// north open   
          newPortal.rotation.z = Math.PI; 
          break;

          case 7:// east open    
          newPortal.rotation.z = Math.PI / -2; 
          break;
        }


        var centPos = new THREE.Vector3();
        let centQuat = new THREE.Quaternion();
        

        centObj.getWorldPosition(centPos);
        //centObj.getWorldQuaternion(centQuat);
        
        
        //add collider
        //const portalShape = new CANNON.Box(new CANNON.Vec3(2,2,1));  
        const portalShape = new CANNON.Sphere(1);  
        const portalBody = new CANNON.Body({
        mass: 0,      
        //position: new CANNON.Vec3(newPortal.position.x,newPortal.position.y+2,newPortal.position.z),
        position: new CANNON.Vec3(centPos.x,centPos.y,centPos.z), 
        shape: portalShape,      
        });
        //portalBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), newPortal.rotation.z)
        //body.position.copy(position);
        ///body.addEventListener('collide',playHitSound);
        world.addBody(portalBody); 

        portalBody.collisionResponse = 0;
        portalBody.addEventListener("collide", function(e){
        console.log(e);
        SendToIsland();
        });


        const portalLight = new THREE.PointLight( 0x00ff00,1,6);
        portalLight.position.set(centPos.x,centPos.y,centPos.z);
        scene.add(portalLight);
        


        //newPost.material = postMat;           
        scene.add(newPortal);         
      }
    );*/


    //sphere3.position.x = furX*10;
    //sphere3.position.z = (furY*10)*-1;

    //console.log("was");
    
    PopWalls();
  }
}

function BuildPortal(xPos,yPos,endFacing)
{
  gltfLoader.load(
    'assets/portal2.glb',
    (gltf) =>
    {
      const newPortal = gltf.scenes[0].children[0];
      
     
      newPortal.position.x = xPos*10;
      newPortal.position.y = 0;
      newPortal.position.z = (yPos*10)*-1;

      
      /*
      newPortal.position.x = 10;
      newPortal.position.y = 0;
      newPortal.position.z = 0;*/


      newPortal.scale.set(.7,.7,.7);

      //create anchor for portal center
      const centObj = new THREE.Object3D();
      //centObj.position.copy(newPortal.position);
      centObj.position.y = -1;        
      centObj.position.z = -2.5;
      centObj.parent = newPortal;    

      
      switch(endFacing)
      {
        case 14: // south open
        
        break;

        case 13://west open
        newPortal.rotation.z = Math.PI / 2; 
        break;

        case 11:// north open   
        newPortal.rotation.z = Math.PI; 
        break;

        case 7:// east open    
        newPortal.rotation.z = Math.PI / -2; 
        break;
      }

      var centPos = new THREE.Vector3();
      let centQuat = new THREE.Quaternion();      

      centObj.getWorldPosition(centPos);
      //centObj.getWorldQuaternion(centQuat);      
      
      //add collider
      //const portalShape = new CANNON.Box(new CANNON.Vec3(2,2,1));  
      const portalShape = new CANNON.Sphere(1);  
      const portalBody = new CANNON.Body({
      mass: 0,      
      //position: new CANNON.Vec3(newPortal.position.x,newPortal.position.y+2,newPortal.position.z),
      position: new CANNON.Vec3(centPos.x,centPos.y,centPos.z), 
      shape: portalShape,      
      });
      //portalBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), newPortal.rotation.z)
      //body.position.copy(position);
      ///body.addEventListener('collide',playHitSound);
      world.addBody(portalBody); 

      portalBody.collisionResponse = 0;
      portalBody.addEventListener("collide", function(e){
      console.log(e);
      SendToIsland();
      });


      const portalLight = new THREE.PointLight( 0x00ff00,1,6);
      portalLight.position.set(centPos.x,centPos.y,centPos.z);
      scene.add(portalLight);
      
             
      scene.add(newPortal);         
    }
  );
}



function CalcProbeNeighbor()
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

function CalcTakeAStep()
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
    
      if(cellArrayNew[curTile].ewObj !== null)
      {            
        cellArrayNew[curTile].ewObj = null;           
      }      
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
     
      if(cellArrayNew[curTile].nwObj !== null)
      {                 
        cellArrayNew[curTile].nwObj = null;        
      }     

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

      if(cellArrayNew[curTile].ewObj !== null)
      {          
        cellArrayNew[curTile].ewObj = null;         
      }         
      
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
      
      if(cellArrayNew[curTile].nwObj !== null)
      {           
        cellArrayNew[curTile].nwObj = null;         
      }        
      cellArrayNew[curTile].tileTypeId -= 4; 
    }
      return;
  }
}

function CalcPlacePosts(xPos,zPos)
{
   //place posts
   for(let row = 0;row<mWidth+1;row++)
   {
    AddPostInstance(row,)
   }
   // place posts  
}

function CalcBuildEWall(xPos,zPos,incCellObj)
{  
  let loadString = RetLoadString();

  if(incCellObj.ewObj == null)
  {
    return;    
  }
 
  gltfLoader.load(
    loadString,
    //'assets/eWall.gltf',
    (gltf) =>
    {
      const newWall = gltf.scenes[0].children[0];
      //newWall.position.x = xPos*10;
      newWall.position.x = xPos*10 +5;//4.8
      newWall.position.y = 0;
      newWall.position.z = (zPos*10)*-1; 
      newWall.rotation.z = Math.PI / 2;
      newWall.scale.set(1,1,1); 
      newWall.material = wallMat;  
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

function CalcBuildNWall(xPos,zPos,incCellObj)
{  
  let loadString = RetLoadString();

  if(incCellObj.nwObj == null)
  {
    return;
  }
 
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
      newWall.position.z = ((zPos*10)*-1)-5;  //4.8
      newWall.scale.set(1,1,1);  
      newWall.material = wallMat;          
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

function PopWalls()
{
  curTile = (curX*mWidth)+curY;   
 
  //this should be block units
  for(let row = 0; row<mWidth; row++)
  {
    for(let column = 0; column<mLength; column++)
    { 

      //for instancing
      //dummyObj.position.set(row*10+4.8, 0, (column*10)*-1);
      //dummyObj.rotation.x = Math.PI / 2;
      //dummyObj.rotation.z = Math.PI / 2;
      //dummyObj.updateMatrix();
      //instancedEMesh.setMatrixAt( row*mWidth+column, dummyObj.matrix);
      
      //for instancing
      //
      

      
      BuildTile(row,column,cellArrayNew[((row*mWidth)+column)]);
      //BuildEWallInstanced(row,column,colObj,dummyObj);
      CalcBuildEWall(row,column,cellArrayNew[((row*mWidth)+column)]);
      CalcBuildNWall(row,column,cellArrayNew[((row*mWidth)+column)]);
        
      
    }
    //instancedEMesh.instanceMatrix.needsUpdate = true;
    //deduct from entrance
  }
  



  //place posts
  /*const postMat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    metalness:0,
    roughness: 0.5
  });*/
  for(let row = 0;row<mWidth+1;row++)
  {
    for(let column = 0;column<mLength+1;column++)
    {
      //AddPostInstance(row,column);    
      gltfLoader.load(
        'assets/Walls/pillar444.glb',
        (gltf) =>
        {
          const newPost = gltf.scenes[0].children[0];
          newPost.position.x = (row*10)-5;
          newPost.position.y = 0;
          newPost.position.z = ((column*10)-5)*-1; 
          newPost.scale.set(1,1,1);  
          //newPost.material = postMat;           
          scene.add(newPost);         
        }
      );
    }
  }
  //instancedPost.instanceMatrix.needsUpdate = true;
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
        newSWall.position.z = 5; //4.8 
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
        newWWall.position.x = -5; //4.8 
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


}
////different order


function BuildEntrance()
{
  BuildTileNoMaze(1,-1);
  BuildTileNoMaze(1,-2); 
}






/*
function CarveExit()
{  
  //open exit
  const exitCell = (exitX*10)+exitY;
  
    if(cellArrayNew[exitCell].nwObj !== null)
    {
      var toGo = cellArrayNew[exitCell].nwObj; 
      scene.remove(toGo);
      cellArrayNew[exitCell].tileTypeId -= 4;
      world.remove(cellArrayNew[exitCell].nwCol);
      //console.log(cellArrayNew[exitCell].tileTypeId);      
    }  
}*/



function CheckFurthestPoint()
{
  if(theStack.length > longestDistance)
  {
    furthestPoint = theStack[theStack.length-1];
    longestDistance = theStack.length;
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
  const platMat = new THREE.MeshStandardMaterial({
    color: '#555555',
    metalness:0,
    roughness: 0.8
  })
  
  gltfLoader.load(
    'assets/platform.gltf',
    (gltf) =>
    {
      const newObj = gltf.scene.children[0];
      newObj.position.x = xPos;
      newObj.position.y = -.2;
      newObj.position.z = zPos;  
      newObj.scale.set(14,14,14)
      newObj.material = platMat;
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


function BuildReward()
{
  gltfLoader.load(
    
    'assets/rIsland.glb',
    (gltf) =>
    {
      const newObj = gltf.scenes[0].children[0];
      //const newEWall = gltf.scene.children[0];
      //const newEWall = gltf.scenes[0].children[0];
      newObj.position.x = -50;
      newObj.position.y = 10;
      newObj.position.z = -40;  //4.8
      newObj.scale.set(.1,.1,.1);  
      newObj.rotation.z = Math.PI/-6
      newObj.material - wallMat;        
      scene.add(newObj);

      //incCellGroup.add(newEWall); 
      //incCellObj.nwObj = newWall;
      //incCellObj.cellG.add(newWall);
      
      //-50,10,-40



      const podShape = new CANNON.Box(new CANNON.Vec3(1,3,1));  
      const podBody = new CANNON.Body({
      mass: 0,      
      position: new CANNON.Vec3(newObj.position.x+1,newObj.position.y+2,newObj.position.z-.6),      
      shape: podShape,      
      });
      //podBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), Math.PI/2)
      //body.position.copy(position);
      ///body.addEventListener('collide',playHitSound);
      world.addBody(podBody); 




     
      const islShape = new CANNON.Box(new CANNON.Vec3(5.5,2.5,6.6));  
      const body = new CANNON.Body({
      mass: 0,
      //position: new CANNON.Vec3(-50.5,7.5,-40),
      position: new CANNON.Vec3(newObj.position.x-.5,newObj.position.y -2.5,newObj.position.z),
      
      shape: islShape,
      // material: defaultMaterial
      });
      body.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), newObj.rotation.z)
      //body.position.copy(position);
      ///body.addEventListener('collide',playHitSound);
      world.addBody(body);  
      //incCellObj.nwCol = body; 

      
      const islBarWall = new CANNON.Box(new CANNON.Vec3(2,6,8));
     
      
      const b1 = new CANNON.Body({
      mass: 0,
      //position: new CANNON.Vec3(-43,10,-37), 
      position: new CANNON.Vec3(newObj.position.x+5.8,newObj.position.y+2,newObj.position.z+3.5),
      shape: islBarWall,      
      });
      b1.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), newObj.rotation.z)      
      world.addBody(b1);
      
      
      const b2 = new CANNON.Body({
        mass: 0,
        //position: new CANNON.Vec3(-56.3,10,-46.3), 
        position: new CANNON.Vec3(newObj.position.x-5.8,newObj.position.y+2,newObj.position.z-5.6),
        shape: islBarWall,      
        });
      b2.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), newObj.rotation.z)        
      world.addBody(b2);

     
    
      const c1 = new CANNON.Body({
        mass: 0,
        //position: new CANNON.Vec3(-50,12,-47),
        position: new CANNON.Vec3(newObj.position.x,newObj.position.y+2,newObj.position.z-7),
        shape: islBarWall,      
        });
        c1.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), newObj.rotation.z+ Math.PI/-3.5 ) //Math.PI/-2.3       
        world.addBody(c1); 
        
        const c2 = new CANNON.Body({
          mass: 0,
          //position: new CANNON.Vec3(-45,12,-47),
          position: new CANNON.Vec3(newObj.position.x+7,newObj.position.y+2,newObj.position.z-5), 
          shape: islBarWall,      
          });
          c2.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0),newObj.rotation.z+Math.PI/3.5)        
          world.addBody(c2);

         
      const c3 = new CANNON.Body({
        mass: 0,
        //position: new CANNON.Vec3(-56,12,-32),
        position: new CANNON.Vec3(newObj.position.x-6,newObj.position.y+2,newObj.position.z+8),
        shape: islBarWall,      
        });
        c3.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0),newObj.rotation.z+ Math.PI/3.7)        
        world.addBody(c3);    
    
        
        const c4 = new CANNON.Body({
          mass: 0,
          //position: new CANNON.Vec3(-52,12,-32), 
          position: new CANNON.Vec3(newObj.position.x-2,newObj.position.y+2,newObj.position.z+8),
          shape: islBarWall,      
          });
          c4.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), newObj.rotation.z + Math.PI/-3.7)        
          world.addBody(c4);

          /*
          const c4a = new CANNON.Body({
            mass: 0,
            //position: new CANNON.Vec3(-52,12,-32), 
            position: new CANNON.Vec3(newObj.position.x-2,newObj.position.y+2,newObj.position.z+8),
            shape: islBarWall,      
            });
            c4a.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), Math.PI/-2.3)        
            world.addBody(c4a);*/

            /*
            const rewardLight = new THREE.PointLight( 0x00ff00, 1, 10);
            rewardLight.position.set(newObj.position.x,newObj.position.y+8,newObj.position.z);
            scene.add(rewardLight);*/     

    }
  );

}

BuildReward();



gltfLoader.load(    
  'assets/sign.glb',
  (gltf) =>
  {
    const newObj = gltf.scenes[0].children[0];
    //const newEWall = gltf.scene.children[0];
    //const newEWall = gltf.scenes[0].children[0];
    newObj.position.x = 12;
    newObj.position.y = 0;
    newObj.position.z = -6;  //4.8
    newObj.scale.set(.5,.5,.5);  
    //newObj.rotation.z = Math.PI/-6
    //newObj.material - wallMat;        
    scene.add(newObj);

    //incCellGroup.add(newEWall); 
    //incCellObj.nwObj = newWall;
    //incCellObj.cellG.add(newWall);
    
    //-50,10,-40


    
    
  
   
  }
);












var trapTest = null;

const fbxLoader = new FBXLoader();
let aniMixers = [];
let animsArr = [];

function BuildTrap(xPos,zPos,hRot)
{  
  fbxLoader.load(
    'assets/wallTrapAnim4.fbx',
    (object)=>
    {      
      trapTest = object;
      object.children[0].material = wallMat;
      object.children[1].material = wallMat;
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

function BuildTrapGLTF(xPos,zPos,hRot)
{
  gltfLoader.load(
    
    'assets/clapTrap.glb',
    (object) =>
    {
      //const newTrap = object.scenes[0].children[0];

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


//CreateEInstance();

//CreatePostInstance();

BuildEntrance();

CalculateMaze();

//RawMazeBuild();

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
        //console.log(cellArrayNew[tileNum].tileTypeId );
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






let playerObj = null;
let camSpot = null;
let charBody = null;

const skeleAnimArr = [];

let skeleMixer;

let idleAction,runAction;

let curAction = 100;


function CreatePlayerObj()
{
  // main player model with idle
  gltfLoader.load(
    'assets/Skele/skeleIdle2.glb',
    (gltf) =>
    {
      gltf.scene.children[0].children[1].material.envMapIntensity = 6;
      gltf.scene.children[0].children[2].material.envMapIntensity = 6;
      gltf.scene.children[0].children[3].material.envMapIntensity = 6;
    

      playerObj = gltf.scene; // might need to declare this out of scope
      playerObj.position.x = 10;
      playerObj.position.y = 0;
      playerObj.position.z = 20;  
      playerObj.rotation.y = Math.PI;
      playerObj.scale.set(1.4,1.4,1.4)

      gltf.scene.traverse( ( object ) => {
          object.frustumCulled = false;  
        } 
      );       

      //optimize this
      skeleMixer = new THREE.AnimationMixer(playerObj);
      aniMixers.push(skeleMixer);
      idleAction = skeleMixer.clipAction(gltf.animations[0]);
      idleAction.setLoop(THREE.LoopRepeat);
      idleAction.enable = true;
    
      skeleAnimArr.push(idleAction);
      //animTest.setLoop(THREE.LoopRepeat);
      //animTest.clampWhenFinished = true;
      ChangeAnimation(0);    
        
      scene.add(playerObj)
    
    
      const charShape = new CANNON.Sphere(1);   
      charBody = new CANNON.Body({
      mass: 1,    
      position: new CANNON.Vec3(0,0,0),
      shape: charShape,
      //material: defaultMaterial
      });
  
      charBody.fixedRotation = true;
      charBody.angularDamping = 1;


      //charBody.position.copy(charSphere.position);
      //charBody.position.copy(playerObj.position);
      charBody.position.set(10,1,20);  //(10,1,20)   //island -54,11,-38.5
      world.addBody(charBody);  
    
      objectsToUpdate.push({
        //mesh: charSphere,
       mesh: playerObj,
        body: charBody
      });

      camSpot = new THREE.Mesh(
      new THREE.SphereBufferGeometry(.2,4,4),
      baseMat2);
      camSpot.castShadow = true;
      //camSpot.scale.set(1,1,2);
      camSpot.position.x = 0;
      camSpot.position.y = 4;//5.7    
      camSpot.position.z = -5;//5
      camSpot.rotation.y -= Math.PI;
      camSpot.rotateX((Math.PI/180)*-20);//-25
      camSpot.visible = false;
      scene.add(camSpot);
      //camSpot.parent = charSphere;
      camSpot.parent = playerObj;

      LoadPlayerAnimations(skeleMixer);
    //// swing the camera down in and begin game when this loads  
    }
  );
}


CreatePlayerObj();

function LoadPlayerAnimations(incMixer)
{
  // player run animation
  gltfLoader.load(
    'assets/Skele/skeleRun.glb',
    (gltf) =>
    {
      //console.log(gltf.scene);
      //const newObj = gltf.scenes[0].children[0];
  
        
  
      /*
      const playerObj = gltf.scene;
      playerObj.position.x = 10;
      playerObj.position.y = 0;
      playerObj.position.z = 20;  
      playerObj.rotation.y = Math.PI;
      playerObj.scale.set(1.4,1.4,1.4)
      
      
      console.log(playerObj);*/
           
  
      
      runAction = incMixer.clipAction(gltf.animations[0]);
      runAction.timeScale = 2;
      runAction.setLoop(THREE.LoopRepeat);
      runAction.enable = true;
      
      skeleAnimArr.push(runAction);
      //animTest.setLoop(THREE.LoopOnce);
      //animTest.clampWhenFinished = true;
      
      //runAction.play();
      //scene.add(playerObj) 

      
    }
  );

    
}

  
function SendToIsland()
{
  charBody.position.x = -52;
  charBody.position.y = 11;
  charBody.position.z = -35;
}


/*
var footSteps = new Howl({
  //src:['assets/Audio/footLoop3.ogg'],
  src:['assets/Audio/fLoop2.ogg'],
  loop: true,   
});*/ 

/*
footSteps.on('fade', function(){
  footSteps.stop()
});

footSteps.on('stop', function(){
  console.log("stopped")
});*/




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
      ChangeAnimation(1);     
    break;

    case "ArrowDown":      
      //speed -= acceler;
      moving = -1;
      ChangeAnimation(2);
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
      ChangeAnimation(0);    
    break;

    case "ArrowDown":      
      speed = 0;
      moving = 0; 
      ChangeAnimation(0);     
    break;
  }
}



////touch controls===========================================================
const leftButton = document.querySelector('#lB');
const upButton = document.querySelector('#uB');
const downButton = document.querySelector('#dB');
const rightButton = document.querySelector('#rB');

//touchstart
leftButton.addEventListener('touchstart', function (event) {
  turning = -1;
  //console.log("left button")
});
upButton.addEventListener('touchstart', function (event) {
  moving = 1;        
  ChangeAnimation(1);  
  //console.log("up button")
});
downButton.addEventListener('touchstart', function (event) {
  moving = -1;
  ChangeAnimation(2);
  //console.log("down button")
});
rightButton.addEventListener('touchstart', function (event) {
  turning = 1;
  //console.log("right button")
});


//touchend
leftButton.addEventListener('touchend', function (event) {
  turning = 0;
  //console.log("left buttonmouseup ")
});
upButton.addEventListener('touchend', function (event) {
  speed = 0;
  moving = 0;        
  ChangeAnimation(0);   
  //console.log("up button mouseup")
});
downButton.addEventListener('touchend', function (event) {
  speed = 0;
  moving = 0;        
  ChangeAnimation(0);   
  //console.log("down button mouseup")
});
rightButton.addEventListener('touchend', function (event) {
  turning = 0;
  //console.log("right button mouseup")
});
////touch controls===========================================================




let currentAction;

function ChangeAnimation(num)
{   

  if(curAction == num)
  {
    return;
  } 

  curAction = num;

  switch(num)
  {    
    case 0:    //go to idle  
    //skeleMixer.stopAllAction();
    //skeleMixer._actions[0].reset();    
    
    if(currentAction)
    {
      currentAction.fadeOut(.3);
    }
   
          
    //footSteps.fade(1,0,300);
   
    

    idleAction.reset();
    idleAction.fadeIn(.3);
    idleAction.play();
    currentAction = idleAction;
    break;
  
    case 1:  // go to run
    //skeleMixer.stopAllAction();

    if(currentAction)
    {
      currentAction.fadeOut(.3);
    }
    //footSteps.stop();
    //footSteps.rate(3);
    //footSteps.volume(1);
   // footSteps.play();
    //skeleAnimArr[1].timeScale =2;
    //skeleAnimArr[1].reset();
    //skeleAnimArr[1].fadeIn(.3);
    //skeleAnimArr[1].play();
    
    runAction.timeScale = 2;
    runAction.reset();    
    runAction.play();
    currentAction = runAction;
    //currentAction = skeleAnimArr[1];
    break;

    case 2:    // run backwards 
    //skeleMixer.stopAllAction();

    if(currentAction)
    {
      currentAction.fadeOut(.3);
    }

    //footSteps.stop();
    //footSteps.rate(2);
    //footSteps.volume(1);
    //footSteps.play();



    runAction.reset();
    runAction.timeScale = -1.33;    
    runAction.play();
    currentAction = runAction;
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

  if(charBody)
  {
    charBody.position.x += speed * Math.sin(-angle);
    charBody.position.z -= speed * Math.cos(-angle);
  }

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
  if(camSpot)
  { 
    camSpot.getWorldPosition(target);
    camSpot.getWorldQuaternion(tarQuat);
//}
  
  /*
  camera.position.x = target.x;
  camera.position.y = target.y;
  camera.position.z = target.z;*/

  camera.position.x = lerp(camera.position.x,target.x,adj);
  camera.position.y = lerp(camera.position.y,target.y,adj);
  camera.position.z = lerp(camera.position.z,target.z,adj);

 

  camera.quaternion.slerp(tarQuat,adj);
  }

  //camera.lookAt(sphere2.position);
  //camera.rotateX((Math.PI/180)*25); 
}



//setTimeout(function() {CarveMaze()}, 5000);
document.addEventListener('keydown', function(e){
  if(e.key === 'p')
  {
    //console.log(cellArray);
    PlaceMazeTraps();
    //console.log(cellArrayNew);
  }  
});

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

document.addEventListener('keydown', function(e){
  if(e.key === 'w')
  {    

    
    //console.log(footSteps);

    //CarveExit();
    //MazeLoop();
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
  if(e.key === 'v')
  {
    console.log(Visited);
  }  
});

document.addEventListener('keydown', function(e){
  if(e.key === 't')
  {    
    //console.log(renderer.info);
    console.log(charBody.position);
  }  
});



//setTimeout(function() { testWallRemove()}, 5000);



//raycaster
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
//raycaster


////Mine==================================================================





////lights==================================================================

const rLoader = new RGBELoader();
rLoader.load('assets/HDR29.hdr', function(texture){
  texture.mapping = THREE.EquirectangularReflectionMapping;
  //scene.background = texture;
  scene.environment = texture;
  //scene.envMapIntensity = 5; 

});


/*
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

scene.add(dirLight);*/

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
  requestAnimationFrame(gameLoop);  

  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - oldElapsedTime;
  oldElapsedTime = elapsedTime;

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
  
  
  // only the player is in this
  for(const object of objectsToUpdate)
  {        
    object.mesh.position.copy(object.body.position);
    object.mesh.position.y -=1;
    object.mesh.position.z;
    object.mesh.quaternion.copy(object.body.quaternion); 
    object.mesh.rotation.y += Math.PI;       
  }  

  for(const trap of trapsToUpdate)
  {    
    trap.body.position.copy(trap.mesh.getWorldPosition(trapTar));
    trap.body.quaternion.copy(trap.mesh.getWorldQuaternion(tarQuat));                  
  }

  moveChar();

  UpdateCam();  
 
  stats.update(); 
  
  
   

  //controls.update();   
  

  //stats.begin();
  

  renderer.render(scene,camera); 

  //stats.end();  
}

//call it once to kick off the loop
gameLoop();
////main game loop==================================================================











////================================================================================
////================================================================================






/*
// main player model with idle
gltfLoader.load(
  'assets/Skele/skeleIdle2.glb',
  (gltf) =>
  {
    //console.log(gltf.scene);
    //const newObj = gltf.scenes[0].children[0];

    gltf.scene.children[0].children[1].material.envMapIntensity = 6;
    gltf.scene.children[0].children[2].material.envMapIntensity = 6;
    gltf.scene.children[0].children[3].material.envMapIntensity = 6;
    

    const playerObj = gltf.scene;
    playerObj.position.x = 10;
    playerObj.position.y = 0;
    playerObj.position.z = 20;  
    playerObj.rotation.y = Math.PI;
    playerObj.scale.set(1.4,1.4,1.4)

    gltf.scene.traverse( ( object ) => {

      object.frustumCulled = false;
  
  } );
    
       

    //optimize this
    skeleMixer = new THREE.AnimationMixer(playerObj);
    aniMixers.push(skeleMixer);
    idleAction = skeleMixer.clipAction(gltf.animations[0]);
    idleAction.setLoop(THREE.LoopRepeat);
    idleAction.enable = true;
    
    skeleAnimArr.push(idleAction);
    //animTest.setLoop(THREE.LoopRepeat);
    //animTest.clampWhenFinished = true;
    ChangeAnimation(0);
    
    
        
    scene.add(playerObj)


    
    const charShape = new CANNON.Sphere(1);   
    charBody = new CANNON.Body({
    mass: 1,    
    position: new CANNON.Vec3(0,0,0),
    shape: charShape,
    //material: defaultMaterial
    });
  
    charBody.fixedRotation = true;
    charBody.angularDamping = 1;


    //charBody.position.copy(charSphere.position);
    //charBody.position.copy(playerObj.position);
    charBody.position.set(10,1,20);  //(10,1,20)   //island -54,11,-38.5
    world.addBody(charBody);  


    
    objectsToUpdate.push({
      //mesh: charSphere,
      mesh: playerObj,
      body: charBody
    });
    
    
    


    camSpot = new THREE.Mesh(
    new THREE.SphereBufferGeometry(.2,4,4),
    baseMat2);
    camSpot.castShadow = true;
    //camSpot.scale.set(1,1,2);
    camSpot.position.x = 0;
    camSpot.position.y = 4;//5.7    
    camSpot.position.z = -6;//5
    camSpot.rotation.y -= Math.PI;
    camSpot.rotateX((Math.PI/180)*-20);//-25
    camSpot.visible = false;
    scene.add(camSpot);
    //camSpot.parent = charSphere;
    camSpot.parent = playerObj;


    LoadPlayerAnimations(skeleMixer);
    //// swing the camera down in and begin game when this loads  
 
  }
);*/
















/*
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
}*/


/*
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
*/













/*
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
      




      //for instancing
      //dummyObj.position.set(row*10+4.8, 0, (column*10)*-1);
      //dummyObj.rotation.x = Math.PI / 2;
      //dummyObj.rotation.z = Math.PI / 2;
      //dummyObj.updateMatrix();
      //instancedEMesh.setMatrixAt( row*mWidth+column, dummyObj.matrix);
      
      //for instancing
      //









      
      BuildTile(row,column,colObj);
      //BuildEWallInstanced(row,column,colObj,dummyObj);
      BuildEWall(row,column,colObj);
      BuildNWall(row,column,colObj);
        

      //cellArray.push(cellGroup);
      cellArrayNew.push(colObj);
    }
    instancedEMesh.instanceMatrix.needsUpdate = true;
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
};*/




/*
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
} */


/*
function ProbeNeighbor()
{   
  neighborCount = 0;

  const nX = Math.floor(curTile/mWidth);
  const nY = (curTile%mWidth);

  
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
}*/

/*
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
};*/

/*
function CarveMaze()
{  

  console.log(cellArray[curTile].children);

    
    
    if(theStack.length > 0)// guard goblins placed
		{
			MazeLoop ();			
    }


}*/






































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









































