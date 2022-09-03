//https://darkstarhub.github.io/ThreeMaze/

//#region Init
////imports=======================================================
////greensock import
const gsap = window.gsap;
//const datG = window.dat.gui;
const sizes = {width:window.innerWidth,height:window.innerHeight};
//const dGui = new dat.GUI();
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

//renderer.outputEncoding = THREE.sRGBEncoding;

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
function createStats() 
{
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
//#endregion Init



//#region Texture Load
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
//#endregion Texture Load





////Mine==================================================================
/*const floorTileTexture = textureLoader.load('assets/grass_4.png');
floorTileTexture.repeat.x = 6;
floorTileTexture.repeat.y = 6;
floorTileTexture.wrapS = THREE.RepeatWrapping;
floorTileTexture.wrapT = THREE.RepeatWrapping;
const floorMat = new THREE.MeshStandardMaterial({map:floorTileTexture})*/

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



/*
const matCapTexture = textureLoader.load('assets/matcaps/9.jpg');
const testMat = new THREE.MeshMatcapMaterial();
testMat.matcap = matCapTexture;*/



const mainTexture = textureLoader.load('assets/Walls/MainText.fw.png');
mainTexture.flipY = false;
mainTexture.encoding = THREE.sRGBEncoding;
/*wallTexture.wrapS = THREE.RepeatWrapping;
wallTexture.wrapT = THREE.RepeatWrapping;*/



const lightStoneMat = new THREE.MeshStandardMaterial({
  color: '#ffffff'
});
const tileMat = new THREE.MeshStandardMaterial({
  color: '#dddddd'
});
const mainMat = new THREE.MeshStandardMaterial({
  /*color: '#cccccc'*/
  map: mainTexture,
  /*emissive: '#242424'*/
});

const wallMat = new THREE.MeshStandardMaterial({
  color: '#cccccc'  
});




 /*
const colorParam = {color: '#ffffff'};
dGui.addColor(colorParam,"color").onChange(()=>
{
  wallMat.color.set(colorParam.color);
});*/



//controls.enableZoom = false;
//controls.enablePan = false;




const gltfLoader = new GLTFLoader();





//#region Physics
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
//#endregion Physics

/*
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
*/





function LoadAll()
{  
  gltfLoader.load(    
    'assets/Walls/pillar444.glb',
    (gltf) =>
    {      
      //instancedPost = new THREE.InstancedMesh(gltf.scenes[0].children[0].geometry, gltf.scenes[0].children[0].material, 121);  
      instancedPost = new THREE.InstancedMesh(gltf.scenes[0].children[0].geometry, lightStoneMat, 121);   
      scene.add(instancedPost); 
      CreateTileInstancesChain()// tiles when posts done
    }); 
}

function CreateTileInstancesChain()
{
  gltfLoader.load(    
    'assets/Walls/tile111tx.glb',
    (gltf) =>
    {         
      iTile1 = new THREE.InstancedMesh(gltf.scenes[0].children[0].geometry, mainMat, tileInstCount); 
      scene.add(iTile1);//tile 1 done 
      //load tile 2
      gltfLoader.load(    
        'assets/Walls/tile222tx.glb',
        (gltf) =>
        {      
          iTile2 = new THREE.InstancedMesh(gltf.scenes[0].children[0].geometry, mainMat, tileInstCount);      
          scene.add(iTile2); //tile 2 done
          //load tile 3
          gltfLoader.load(    
            'assets/Walls/tile333tx.glb',
            (gltf) =>
            {      
              iTile3 = new THREE.InstancedMesh(gltf.scenes[0].children[0].geometry, mainMat, tileInstCount);      
              scene.add(iTile3);//tile 3 done 
              //load tile 4
              gltfLoader.load(    
                'assets/Walls/tile444tx.glb',
                (gltf) =>
                {      
                  iTile4 = new THREE.InstancedMesh(gltf.scenes[0].children[0].geometry, mainMat, tileInstCount);      
                  scene.add(iTile4);//tile 4 done
                  // call something else             
                });         
            });
        });
      });
}








//#region Build out
function BuildTile(xPos,zPos,incCellObj)
{    

    AddTileInstance(xPos,zPos);//xPos*10, 0, (zPos*10)*-1  

    const body = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3((xPos*10),-.5,(zPos*10)*-1),      
        shape: tileShape,
        // material: defaultMaterial
    });      
        //body.position.copy(position);
        ///body.addEventListener('collide',playHitSound);
    world.addBody(body);   
    incCellObj.tileCol = body;


  /*  
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
     
    }
  );*/
}


function BuildTileNoMaze(xPos,zPos)
{    
  const num = Math.floor((Math.random() * 4));
  let loadString = 'assets/Walls/tile111tx.glb';
  switch(num)
  {    
    case 0:    
    loadString = 'assets/Walls/tile111tx.glb'
    break;
    
    case 1:      
    loadString = 'assets/Walls/tile222tx.glb'
    break;

    case 2:     
    loadString = 'assets/Walls/tile333tx.glb'  
    break;

    case 3:      
    loadString = 'assets/Walls/tile444tx.glb' 
    break;
  }
  gltfLoader.load(
    //'assets/fTile2.gltf',
    loadString,
    (gltf) =>
    {
      //const newTile = gltf.scene.children[0];
      const newTile = gltf.scenes[0].children[0];
      newTile.material = mainMat;
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




//const api = {count: 200};




//instances===================================================

const dummyObj = new THREE.Object3D();//new for instancing
var instancedPost;

const dummyTileObj = new THREE.Object3D();//new for instancing
var iTile1,iTile2,iTile3,iTile4

const dummyWallObj = new THREE.Object3D();//new for instancing
const dummyEWallObj = new THREE.Object3D();//new for instancing
var instancedWall1,instancedWall2,instancedWall3,instancedWall4;

//let ind1 = 0,ind2=0,ind3=0,ind4=0;
const tileIndexArray = [0,0,0,0];
const tileInstCount = 30;
const wallIndexArray = [0,0,0,0];
const wallInstCount = 60;

  
function CreatePostInstance()
{
  gltfLoader.load(    
    'assets/Walls/pillar444.glb',
    (gltf) =>
    {      
      //instancedPost = new THREE.InstancedMesh(gltf.scenes[0].children[0].geometry, gltf.scenes[0].children[0].material, 121);  
      instancedPost = new THREE.InstancedMesh(gltf.scenes[0].children[0].geometry, lightStoneMat, 121);   
      scene.add(instancedPost); 

    });    
}

function AddPostInstance(xPos,zPos)
{      
  //for instancing
    dummyObj.position.set((xPos*10)-5, 0, ((zPos*10)-5)*-1); 
    dummyObj.rotation.x = Math.PI / 2;
    dummyObj.updateMatrix();
    //console.log((xPos*(mWidth+1))+zPos);
    instancedPost.setMatrixAt((xPos*(mWidth+1))+zPos, dummyObj.matrix); 
    instancedPost.instanceMatrix.needsUpdate = true;
  //for instancing
}


function CreateTileInstances()
{
    gltfLoader.load(    
        'assets/Walls/tile111tx.glb',
        (gltf) =>
        {      
          //iTile1 = new THREE.InstancedMesh(gltf.scenes[0].children[0].geometry, gltf.scenes[0].children[0].material, tileInstCount);  
          iTile1 = new THREE.InstancedMesh(gltf.scenes[0].children[0].geometry, mainMat, tileInstCount); 
          scene.add(iTile1);         
        });
    gltfLoader.load(    
        'assets/Walls/tile222tx.glb',
        (gltf) =>
        {      
          iTile2 = new THREE.InstancedMesh(gltf.scenes[0].children[0].geometry, mainMat, tileInstCount);      
          scene.add(iTile2);       
        });
    gltfLoader.load(    
        'assets/Walls/tile333tx.glb',
        (gltf) =>
        {      
          iTile3 = new THREE.InstancedMesh(gltf.scenes[0].children[0].geometry, mainMat, tileInstCount);      
          scene.add(iTile3);     
        });
    gltfLoader.load(    
        'assets/Walls/tile444tx.glb',
        (gltf) =>
        {      
          iTile4 = new THREE.InstancedMesh(gltf.scenes[0].children[0].geometry, mainMat, tileInstCount);      
          scene.add(iTile4);             
        });
}

function AddTileInstance(xPos,zPos)
{
    dummyTileObj.position.set(xPos*10, 0, (zPos*10)*-1);  
    dummyTileObj.rotation.x = Math.PI / 2;
    /*
    if(Math.floor((Math.random() * 4)) >1)
    {
      console.log("was",(xPos*10)+zPos);
      dummyTileObj.rotation.z = Math.PI/2;
    }*/
    dummyTileObj.updateMatrix();

    let tNum = Math.floor((Math.random() * 4));  
    
    let fNum = FindValidIndex(tNum,tileIndexArray,tileInstCount);
    //console.log("tile",(xPos*10)+zPos,"fnum",fNum,"index",tileIndexArray[fNum]);

  switch(fNum)
  {    
    case 0:
    iTile1.setMatrixAt(tileIndexArray[0], dummyTileObj.matrix); 
    iTile1.instanceMatrix.needsUpdate = true;
    tileIndexArray[0]++;     
    break;
    
    case 1:      
    iTile2.setMatrixAt(tileIndexArray[1], dummyTileObj.matrix); 
    iTile2.instanceMatrix.needsUpdate = true;
    tileIndexArray[1]++;
    break;

    case 2:     
    iTile3.setMatrixAt(tileIndexArray[2], dummyTileObj.matrix); 
    iTile3.instanceMatrix.needsUpdate = true;
    tileIndexArray[2]++;
    break;

    case 3:      
    iTile4.setMatrixAt(tileIndexArray[3], dummyTileObj.matrix); 
    iTile4.instanceMatrix.needsUpdate = true;
    tileIndexArray[3]++;
    break;
  }
}



function CreateWallInstances()
{
  gltfLoader.load(    
    'assets/Walls/wall1111.glb',
    (gltf) =>
    {       
      instancedWall1 = new THREE.InstancedMesh(gltf.scenes[0].children[0].geometry, mainMat, wallInstCount);  
      //instancedWall1 = new THREE.InstancedMesh(gltf.scenes[0].children[0].geometry, wallMat, wallInstCount); 
      scene.add(instancedWall1);         
    });
  gltfLoader.load(    
    'assets/Walls/wall2222.glb',
    (gltf) =>
    {      
      instancedWall2 = new THREE.InstancedMesh(gltf.scenes[0].children[0].geometry, mainMat, wallInstCount);      
      scene.add(instancedWall2);       
    });
  gltfLoader.load(    
    'assets/Walls/wall3333.glb',
    (gltf) =>
    {      
      instancedWall3 = new THREE.InstancedMesh(gltf.scenes[0].children[0].geometry, mainMat, wallInstCount);      
      scene.add(instancedWall3);     
    });
  gltfLoader.load(    
    'assets/Walls/wall4444.glb',
    (gltf) =>
    {      
      instancedWall4 = new THREE.InstancedMesh(gltf.scenes[0].children[0].geometry, mainMat, wallInstCount);      
      scene.add(instancedWall4);          
    });
}


function AddNWallInstance(xPos,zPos,turn)// turn 1 is nWall 
{     
  dummyWallObj.position.set(xPos*10,0,((zPos*10)*-1)-5);      
  dummyWallObj.rotation.x = Math.PI / 2;    
   
  dummyWallObj.updateMatrix();

  const wallNum = Math.floor((Math.random() * 4));  
    
  let fWNum = FindValidIndex(wallNum,wallIndexArray,wallInstCount);

  switch(fWNum)
  {    
    case 0:
    instancedWall1.setMatrixAt(wallIndexArray[0], dummyWallObj.matrix); 
    instancedWall1.instanceMatrix.needsUpdate = true;
    wallIndexArray[0]++;
    break;
    
    case 1:      
    instancedWall2.setMatrixAt(wallIndexArray[1], dummyWallObj.matrix); 
    instancedWall2.instanceMatrix.needsUpdate = true;
    wallIndexArray[1]++
    break;

    case 2:     
    instancedWall3.setMatrixAt(wallIndexArray[2], dummyWallObj.matrix); 
    instancedWall3.instanceMatrix.needsUpdate = true;
    wallIndexArray[2]++
    break;

    case 3:      
    instancedWall4.setMatrixAt(wallIndexArray[3], dummyWallObj.matrix); 
    instancedWall4.instanceMatrix.needsUpdate = true;
    wallIndexArray[3]++
    break;
  }
}

function AddEWallInstance(xPos,zPos,turn)// turn 1 is nWall 
{        
  dummyEWallObj.rotation.x = Math.PI / 2;          
  dummyEWallObj.position.set((xPos*10)+5, 0, (zPos*10)*-1);    
  dummyEWallObj.rotation.z = Math.PI / 2;
    
  dummyEWallObj.updateMatrix();

  const wallNum = Math.floor((Math.random() * 4)); 
  
  let fWNum = FindValidIndex(wallNum,wallIndexArray,wallInstCount);  

  switch(fWNum)
  {    
    case 0:
    instancedWall1.setMatrixAt(wallIndexArray[0], dummyEWallObj.matrix); 
    instancedWall1.instanceMatrix.needsUpdate = true;
    wallIndexArray[0]++;
    break;
    
    case 1:      
    instancedWall2.setMatrixAt(wallIndexArray[1], dummyEWallObj.matrix); 
    instancedWall2.instanceMatrix.needsUpdate = true;
    wallIndexArray[1]++
    break;

    case 2:     
    instancedWall3.setMatrixAt(wallIndexArray[2], dummyEWallObj.matrix); 
    instancedWall3.instanceMatrix.needsUpdate = true;
    wallIndexArray[2]++
    break;

    case 3:      
    instancedWall4.setMatrixAt(wallIndexArray[3], dummyEWallObj.matrix); 
    instancedWall4.instanceMatrix.needsUpdate = true;
    wallIndexArray[3]++
    break;
  }
}



function FindValidIndex(arrPos,arr,count)
{
  //const initPos = arrPos;
  let found = false;

  if(arr[arrPos]<count)
  {    
    return arrPos;// index is ok
  }
  
  //index is not ok from here.. find a valid, or null
  let loopArrPos = arrPos+1; 
  if(loopArrPos> (arr.length-1))
  {
     loopArrPos = 0;                
  }

  // run a for loop here
  for(let i =0; i<arr.length;i++)
  {      

    if(arr[loopArrPos]<count)
    {
      found = true;     
      return loopArrPos;// index is ok
      break;
    }

    loopArrPos++;// go to next
    if(loopArrPos> (arr.length-1))
    {
     loopArrPos = 0;                
    }
    
    /*
    if(nextArrPos == initPos)// if back at the beginning
    {
      break;
    }*/
  }

  if(found == false)
  {    
    return null;
  }      
}


//instances===============================






 



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
 
    
    PopWalls();
  }
}

const portTex = textureLoader.load('assets/fxDot.png');
const ringTex = textureLoader.load('assets/fxRing.png');

function CreatePortalFX(xPos,yPos,zPos)
{  
  //textureLoader.load('assets/fxDot.png',function()
  //{    
    //portalGeo = new THREE.PlaneBufferGeometry(10,10);

    const points = [];
    points.push(new THREE.Vector3(0, 0, 0)); 
    portalGeo = new THREE.BufferGeometry().setFromPoints(points);

    portMat = new THREE.PointsMaterial(
    {
      //alphaTest: .5,
      //alphaMap: portTex,
      opacity: .5,
      color: 0x00ff00,
      map: portTex,
      size: 5.6,
      sizeAttenuation: true,
      transparent: true
    });

    ringMat = new THREE.PointsMaterial(
      {
        //alphaTest: .5,
        //alphaMap: portTex,
        //opacity: .5,
        color: 0x00ff00,
        map: ringTex,
        size: 5.6,
        sizeAttenuation: true,
        transparent: true
      });
         
    let particle = new THREE.Points(portalGeo,portMat);      
    particle.position.set(
      xPos,
      yPos+.1,
      zPos 
      );
      //particle.rotation.x = Math.PI/2;
    //particle.rotation.z = Math.random()*360;
    //portalParticles.push(particle);
    particle.frustumCulled = false;   
    scene.add(particle);  
    
    let ringPart = new THREE.Points(portalGeo,ringMat);      
    ringPart.position.set(
      xPos,
      yPos+.1,
      zPos 
      );
      //particle.rotation.x = Math.PI/2;
    //particle.rotation.z = Math.random()*360;
    //portalParticles.push(particle); 
    ringPart.frustumCulled = false;   
    scene.add(ringPart); 
    
  //});
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
      
      
      CreatePortalFX(centPos.x,centPos.y,centPos.z);


      
      
      PortalSoundSpatial(centPos.x,centPos.z);
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

function CalcBuildEWall(xPos,zPos)
{  
  //let loadString = RetLoadString();
  
  //if(incCellObj.ewObj == null)
  //{
    //return;    
  //}

  
  AddEWallInstance(xPos,zPos,0);

  const body = new CANNON.Body({
    mass: 0,
    //position: new CANNON.Vec3(newWall.position.x+ 4.8,newWall.position.y +2.5,newWall.position.z),
    position: new CANNON.Vec3(xPos*10 +5,2.5,(zPos*10)*-1),
    shape: EWshape,
    // material: defaultMaterial
    });
    //body.position.copy(position);
    ///body.addEventListener('collide',playHitSound);
    world.addBody(body);


 /*
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
  );*/


}

function CalcBuildNWall(xPos,zPos)
{  
  //let loadString = RetLoadString();

  //if(incCellObj.nwObj == null)
  //{
   //return;
  //}


  AddNWallInstance(xPos,zPos,1);


  const body = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3((xPos*10),2.5,((zPos*10)*-1)-5),
    
    shape: NWshape,
    // material: defaultMaterial
    });
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0),Math.PI*.5)
    //body.position.copy(position);
    ///body.addEventListener('collide',playHitSound);
    world.addBody(body);  
    //incCellObj.nwCol = body;  






    /*
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
  );*/
}

function PopWalls()
{
  curTile = (curX*mWidth)+curY;   
 
  //this should be block units
  for(let row = 0; row<mWidth; row++)
  {
    for(let column = 0; column<mLength; column++)
    {       
      BuildTile(row,column,cellArrayNew[((row*mWidth)+column)]);      
       
      if(cellArrayNew[((row*mWidth)+column)].ewObj != null)
      {
        CalcBuildEWall(row,column);
      }
      if(cellArrayNew[((row*mWidth)+column)].nwObj != null)
      {
        CalcBuildNWall(row,column); 
      }      
    }   
  }
 


  //place posts 
  for(let row = 0;row<mWidth+1;row++)
  {
    for(let column = 0;column<mLength+1;column++)
    {      
      AddPostInstance(row,column);      
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
    CalcBuildNWall(row,-1);  
  }


  //left side walls
  for(let column = 0;column<mLength;column++)
  { 
    CalcBuildEWall(-1,column);  
  }
  //edge walls

}



function BuildEntrance()
{
  BuildTileNoMaze(1,-1);
  BuildTileNoMaze(1,-2); 
  
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


/*
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
*/

/*
function testBuildInstanced()
{
  gltfLoader.load(
    'assets/Walls/wall11tx.glb',
    (gltf) =>
    {   
     

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
    }
  );
}
*/





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
      newObj.position.y = -.1;
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


      const sideWall = new CANNON.Box(new CANNON.Vec3(5*14,20,3)); 
      const lWall = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(newObj.position.x-73,newObj.position.y,newObj.position.z),     
      shape: sideWall,
      // material: defaultMaterial
      });      

      lWall.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), Math.PI/2)
      //body.position.copy(position);
      ///body.addEventListener('collide',playHitSound);
      world.addBody(lWall);   

     
      const rWall = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(newObj.position.x+73,newObj.position.y,newObj.position.z),     
      shape: sideWall,
      // material: defaultMaterial
      });      

      rWall.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), Math.PI/2)
      //body.position.copy(position);
      ///body.addEventListener('collide',playHitSound);
      world.addBody(rWall); 


      const backWall = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(newObj.position.x,newObj.position.y,newObj.position.z+73),     
        shape: sideWall,
        // material: defaultMaterial
        });      
  
        //rWall.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), Math.PI/2)
        //body.position.copy(position);
        ///body.addEventListener('collide',playHitSound);
        world.addBody(backWall); 
  
        const frontWall = new CANNON.Body({
          mass: 0,
          position: new CANNON.Vec3(newObj.position.x,newObj.position.y,newObj.position.z-73),     
          shape: sideWall,
          // material: defaultMaterial
          });      
    
          //rWall.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), Math.PI/2)
          //body.position.copy(position);
          ///body.addEventListener('collide',playHitSound);
          world.addBody(frontWall);       
   
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

    }
  );

}

BuildReward();







//var trapTest = null;

let trapsOut = false;

const fbxLoader = new FBXLoader();
let aniMixers = [];
//let animsArr = [];
let trapArr = [];

function BuildTrap(xPos,zPos,hRot)
{  
  fbxLoader.load(
    'assets/wallTrapAnim4.fbx',
    (object)=>
    {      
      //trapTest = object;
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

      let trapObj = {
        //cellG: cellGroup,
        x: xPos,
        z: zPos,
        animClip: null,        
      };


      

    mixer = new THREE.AnimationMixer(object);
    aniMixers.push(mixer);
    animTest = mixer.clipAction(object.animations[0]);
    
    
    animTest.setLoop(THREE.LoopOnce);
    animTest.clampWhenFinished = true;
    animTest.enable = true;

    //animsArr.push(animTest);
    trapObj.animClip = animTest;
    trapArr.push(trapObj);


      
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

/*
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
*/


function FireTrap(objAnim)
{
/*
  objAnim.reset();      
  objAnim.play();
  //console.log(objAnim);
  TrapSoundSpatial(5,5);
  const inter = (Math.floor((Math.random() * 4))+1)*1000;
  setTimeout(function() { FireTrap(objAnim)}, inter);*/

  objAnim.animClip.reset();      
  objAnim.animClip.play();
  //console.log(objAnim);
  TrapSoundSpatial(objAnim.x,objAnim.z);
  const inter = (Math.floor((Math.random() * 4))+1)*1000;
  setTimeout(function() { FireTrap(objAnim)}, inter);
}
  
function FireTraps()
{
  /*
  for(const ani of animsArr)
  {
    ani.reset();      
    ani.play();
    const inter = (Math.floor((Math.random() * 4))+1)*1000;
    setTimeout(function() { FireTrap(ani)}, inter);
  } */

  for(const ani of trapArr)
  {
    ani.animClip.reset();      
    ani.animClip.play();
    const inter = (Math.floor((Math.random() * 4))+1)*1000;
    setTimeout(function() { FireTrap(ani)}, inter);
  } 

}



BuildEntrance();




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
  //trapsOut = true;
  //FireTraps();
}
//#endregion Build out

//#region Player Object
/*
const bigPlayertex = textureLoader.load('assets/Skele/skBigRed.png');
bigPlayertex.flipY = false;
bigPlayertex.encoding = THREE.sRGBEncoding;*/

const playerRed = textureLoader.load('assets/Skele/skRed3.png');
playerRed.flipY = false;
playerRed.encoding = THREE.sRGBEncoding;

const playerBlue = textureLoader.load('assets/Skele/skBlue.png');
playerBlue.flipY = false;
playerBlue.encoding = THREE.sRGBEncoding;

const playerGreen = textureLoader.load('assets/Skele/skGreen.png');
playerGreen.flipY = false;
playerGreen.encoding = THREE.sRGBEncoding;

let pCurTexNum = 0;




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
      wallMat);
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
//#endregion Player Object




  
function SendToIsland()
{
  charBody.position.x = -52;
  charBody.position.y = 11;
  charBody.position.z = -35;
}




document.addEventListener('keydown', function(e){
  if(e.key === '1')
  {
    trapTogg.click();
  }  
});

document.addEventListener('keydown', function(e){
  if(e.key === '2')
  {
    
  }  
});

document.addEventListener('keydown', function(e){
  if(e.key === '3')
  {

  }  
});



//#region Particles
//const portalParticles = [];

/*
function CreatePortalFX()
{
  textureLoader.load('assets/smoke3.png',function(texture)
  {    
    portalGeo = new THREE.PlaneBufferGeometry(10,10);
    portMat = new THREE.PointsMaterial(
    {
      alphaTest: .5,
      alphaMap: texture,
      map: texture,
      size: 10,
      sizeAttenuation: true,
      transparent: true
    });
    for(let p =8;p>2;p--)
    {      
      let particle = new THREE.Points(portalGeo,portMat);      
      particle.position.set(
        10 + .001*p*Math.cos((.01*p*Math.PI)/180),
        2 + .001*p*Math.sin((.01*p*Math.PI)/180),
        0 + .01*p
        );
      //particle.rotation.x = Math.PI/2;
      particle.rotation.z = Math.random()*360;
      portalParticles.push(particle);
      scene.add(particle);
    }
  });
}*/






/*
const pointtex = textureLoader.load('assets/smoke2.png');


const particlesGeometry = new THREE.SphereBufferGeometry(6,32,32);
const particlesMaterial = new THREE.PointsMaterial(
  {
    map: pointtex,
    size: 0.2,
    sizeAttenuation: true,
    transparent: true
  }
);
const particles = new THREE.Points(particlesGeometry,particlesMaterial);

particles.position.set(10,3,0);
scene.add(particles);*/





////rain =====================================================
//const rainGeo = new THREE.BufferGeometry();
//const vertices = [];


/*
function CreateRain()
{
  //const points = [];

  //rainGeo = new THREE.Geometry();
  for(let i=0;i< 2000;i++)
  {
    //rainDrop = new THREE.Vector3(
      vertices.push(
      Math.random()*200-100,
      Math.random()*100-50,
      Math.random()*200-100,
      );      
    //);
    //rainDrop.velocity = {};
    //rainDrop.velocity = 0;    
    //rainGeo.vertices.push(rainDrop);
    //points.push(rainDrop);
  }    

  rainGeo.setAttribute( 'position', new THREE.Float32BufferAttribute(vertices,3));



  //rainGeo = new THREE.BufferGeometry().setFromPoints(points);
  //rainGeo.setFromPoints(points);
  //console.log(rainGeo.attributes.position);

  rainMat = new THREE.PointsMaterial({
    alphaTest: .1,
    size: .6,
    transparent: true, 
    map: portTex
  });

  rain = new THREE.Points(rainGeo,rainMat);
  rain.position.set(50,50,0);
  scene.add(rain);
}

CreateRain();


function rainVariation() 
{
  var positionAttribute = rain.geometry.getAttribute('position');
  //console.log(positionAttribute);
  let vertex = new THREE.Vector3();
	
  for ( var i = 0; i < positionAttribute.count; i ++ ) 
  {	
    vertex.fromBufferAttribute( positionAttribute, i );		
    vertex.y -= 0.3 + Math.random() * 0.1;//1		
    
    if (vertex.y < - 50) 
    {
      vertex.y = 50;
    }		
    positionAttribute.setXYZ( i, vertex.x, vertex.y, vertex.z );	
  }
  positionAttribute.needsUpdate = true;
}*/
////rain =====================================================
//#endregion Particles





//#region Audio
////Audio======================================================

//Howler.pos(10,0,20);

var footSteps = new Howl({
  //src:['assets/Audio/footLoop3.ogg'],
  src:['assets/Audio/runLoop.ogg'],
  loop: true,   
}); 


var portalSound = new Howl({
  //src:['assets/Audio/footLoop3.ogg'],
  //src:['assets/Audio/portalLoop.wav'],
  src:['assets/Audio/portalLoop2.ogg'],
  loop: true,    
}); 

function PortalSoundSpatial(x,z) {  

  // Play the lightning sound.  
  var id = portalSound.play();
  portalSound.pannerAttr(id).maxDistance = 10000;
  portalSound.pannerAttr(id).distanceModel= 'exponential';
  portalSound.pannerAttr(id).rolloffFactor= 1.08;
  //console.log(portalSound.pannerAttr(id))

  // Change the position and rate.
  portalSound.pos(x, 0, z, id); 
}

var trapSound = new Howl({
  //src:['assets/Audio/footLoop3.ogg'],
  src:['assets/Audio/trapSound.ogg'],  
}); 

function TrapSoundSpatial(x,z) {  

  // Play the lightning sound.
  var id = trapSound.play();
  trapSound.pannerAttr(id).maxDistance = 10000;
  trapSound.pannerAttr(id).distanceModel= 'exponential';
  trapSound.pannerAttr(id).rolloffFactor= 1;
  //console.log(portalSound.pannerAttr(id))

  // Change the position and rate.
  trapSound.pos(x, 0, z, id); 
}



////Audio======================================================
//#endregion Audio




//#region Player controls
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
//#endregion Player controls





////UI===========================================================================
////=============================================================================



const optButton = document.querySelector('.optButton');
const optionsBar = document.querySelector('.optBar');



let gearsOpen = false;

optButton.addEventListener('click', function (event) {
 
  
  if(!gearsOpen)  
  {
      gearsOpen = true;
      //let innerSpin = gsap.to(inner, {rotation: 1440, duration: 1});
      //innerSpin.play();
      gsap.to(optButton, {rotation: 540, duration: 1});
      gsap.to(this, 0.4, {scale:1.3, ease:Bounce.easeOut});
      gsap.to(this, 0.2, {scale:1, delay:0.4})
      unfurlBar();
      
  } 
  else{
      gearsOpen = false;
      //let innerSpin = gsap.to(inner, {rotation: 0, duration: 1});
      //innerSpin.play();
      gsap.to(optButton, {rotation: 0, duration: 1});  
      gsap.to(this, 0.4, {scale:.8, ease:Bounce.easeOut});
      gsap.to(this, 0.2, {scale:1, delay:0.4}) 
      refurlBar();
  } 
});

// shuold unfurl amount based on percent of window
function unfurlBar(){
  gsap.to(optionsBar, {y: 360, duration: 1});     
}

function refurlBar(){
  gsap.to(optionsBar, {y: 0, duration: 1});  
}

const resetBut = document.querySelector('.resetButton');


resetBut.addEventListener('click', function (event) {
  //console.log("clicked")
gsap.to(this, 0.1, {scale:.8/*, ease:Bounce.easeOut*/});
  gsap.to(this, 0.1, {scale:1, delay:0.1})
  setTimeout(function() {window.location.reload()}, 200);
  //window.location.reload();
});





// menu buttons
const lCCChev = document.querySelector('#ccCL');
const rCCChev = document.querySelector('#ccCR');
const lCCBut = document.querySelector('#ccL');
const rCCBut = document.querySelector('#ccR');
const DccBut = document.querySelector('#ccDisp');




rCCBut.addEventListener('click', function (event) {  
  gsap.to(this, 0.1, {scale:.8});
  gsap.to(this, 0.1, {scale:1, delay:0.1});  
  SwapPlayerTex(1);  
});

lCCBut.addEventListener('click', function (event) {  
  gsap.to(this, 0.1, {scale:.8});
  gsap.to(this, 0.1, {scale:1, delay:0.1}); 
  SwapPlayerTex(-1);  
});

lCCBut.style.display = "none";

function SwapPlayerTex(inc)
{ 
  pCurTexNum += inc;
  if(pCurTexNum>2)
  {
    pCurTexNum = 0;
  }
  if(pCurTexNum<0)
  {
    pCurTexNum = 2;
  }
 
  
  switch(pCurTexNum)
  {
    case 0:
    DccBut.innerHTML = "Red"
    playerObj.children[0].children[3].material.map = playerRed;
    lCCBut.style.display = "none";
    rCCBut.style.display = "Block";
    break;

    case 1:
    DccBut.innerHTML = "Green"
    playerObj.children[0].children[3].material.map = playerGreen;
    lCCBut.style.display = "block";
    rCCBut.style.display = "Block";
    break;

    case 2: 
    DccBut.innerHTML = "Blue"    
    playerObj.children[0].children[3].material.map = playerBlue; 
    lCCBut.style.display = "block";
    rCCBut.style.display = "none";
    break;
  }
}


const lEnvChev = document.querySelector('#envCL');
const rEnvChev = document.querySelector('#envCR');
const lEnvBut = document.querySelector('#envL');
const rEnvBut = document.querySelector('#envR');
const dEnvBut = document.querySelector('#envDisp');


lEnvBut.addEventListener('click', function (event) {    
  gsap.to(this, 0.1, {scale:.8});
  gsap.to(this, 0.1, {scale:1, delay:0.1}); 
  SwapEnvTex(-1);  
});

rEnvBut.addEventListener('click', function (event) {    
  gsap.to(this, 0.1, {scale:.8});
  gsap.to(this, 0.1, {scale:1, delay:0.1});  
  SwapEnvTex(1);  
});


lEnvBut.style.display = "none";

function SwapEnvTex(inc)
{     
  envTexNum += inc;
  if(envTexNum>2)
  {
    envTexNum = 0;
  }
  if(envTexNum<0)
  {
    envTexNum = 2;
  }
 
  
  switch(envTexNum)
  {
    case 0:
    dEnvBut.innerHTML = "Day"
    scene.environment = dayEnvTex;
    lEnvBut.style.display = "none";
    rEnvBut.style.display = "Block";
    break;

    case 1:
    dEnvBut.innerHTML = "Dusk"
    scene.environment = duskEnvTex;     
    lEnvBut.style.display = "block";
    rEnvBut.style.display = "Block";
    break;

    case 2: 
    dEnvBut.innerHTML = "Night"    
    scene.environment = nightEnvTex;
    lEnvBut.style.display = "block";
    rEnvBut.style.display = "none";
    break;
  }
}




var volSlider = document.getElementById("myRange");
//var output = document.getElementById("demo");
//output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
volSlider.oninput = function() {
  //output.innerHTML = this.value;  
  Howler.volume(this.value/100);
}


const trapTogg = document.querySelector('#trapTog');


trapTogg.addEventListener('change', (e) => {
  this.checkboxValue = e.target.checked ? 'on' : 'off';
  console.log(this.checkboxValue)
})





// menu buttons








////touch controls===========================================================
const leftButton = document.querySelector('#lB');
const upButton = document.querySelector('#uB');
const downButton = document.querySelector('#dB');
const rightButton = document.querySelector('#rB');

//touchstart  //mousedown
leftButton.addEventListener('touchstart', function (event) {
  event.preventDefault();
  turning = -1;
  //console.log("left button")
});
upButton.addEventListener('touchstart', function (event) {
  event.preventDefault();
  moving = 1;        
  ChangeAnimation(1);  
  //console.log("up button")
});
downButton.addEventListener('touchstart', function (event) {
  event.preventDefault();
  moving = -1;
  ChangeAnimation(2);
  //console.log("down button")
});
rightButton.addEventListener('touchstart', function (event) {
 event.preventDefault();
  turning = 1;
  //console.log("right button")
});


//touchend  //mouseup
leftButton.addEventListener('touchend', function (event) {
  event.preventDefault();
  turning = 0;
  //console.log("left buttonmouseup ")
});
upButton.addEventListener('touchend', function (event) {
  event.preventDefault();
  speed = 0;
  moving = 0;        
  ChangeAnimation(0);   
  //console.log("up button mouseup")
});
downButton.addEventListener('touchend', function (event) {
  event.preventDefault();
  speed = 0;
  moving = 0;        
  ChangeAnimation(0);   
  //console.log("down button mouseup")
});
rightButton.addEventListener('touchend', function (event) {
  event.preventDefault();
  turning = 0;
  //console.log("right button mouseup")
});
////touch controls===========================================================






////UI===========================================================================
////=============================================================================








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
   
          
    footSteps.fade(1,0,300);
   
    

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
    footSteps.stop();
    footSteps.rate(1);
    footSteps.volume(.3);
    footSteps.play();
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

    footSteps.stop();
    footSteps.rate(.66);
    footSteps.volume(.3);
      footSteps.play();



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
      //instancedPost.material = baseMat2;


      
    CalculateMaze();    

    

  
    
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
    if(e.key === 'q')
    {    
  
        CreateTileInstances();
        CreateWallInstances();
        CreatePostInstance();      
      
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
    console.log(cellArrayNew);
  }  
});

document.addEventListener('keydown', function(e){
  if(e.key === 't')
  {    
    console.log(renderer.info);
    //console.log(charBody.position);
  }  
});



//setTimeout(function() { testWallRemove()}, 5000);









////Mine==================================================================








//#region Lights
////lights==================================================================

const rLoader = new RGBELoader();


const dayEnvTex = rLoader.load('assets/HDR29.hdr', function(){ 
  //rLoader.load('assets/Buildings.hdr', function(texture){  
  dayEnvTex.mapping = THREE.EquirectangularReflectionMapping;
  //scene.background = texture;
  scene.environment = dayEnvTex;
  //scene.envMapIntensity = 5; 
});

/*
const dayEnvTex = rLoader.load('assets/HDR29.hdr');
dayEnvTex.mapping = THREE.EquirectangularReflectionMapping;*/

/*
const duskEnvTex = rLoader.load('assets/Buildings.hdr');
duskEnvTex.mapping = THREE.EquirectangularReflectionMapping;*/

const duskEnvTex = rLoader.load('assets/Buildings.hdr', function(){   
  duskEnvTex.mapping = THREE.EquirectangularReflectionMapping;
  //scene.environment = duskEnvTex;   
});

/*
const nightEnvTex = rLoader.load('assets/Snowy2.hdr');
nightEnvTex.mapping = THREE.EquirectangularReflectionMapping;*/

const nightEnvTex = rLoader.load('assets/Snowy2.hdr', function(){   
  nightEnvTex.mapping = THREE.EquirectangularReflectionMapping;
  //scene.environment = nightEnvTex;  
});




let envTexNum = 0;

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
//#endregion Lights




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





////post processing=================================================
//const composer = new EffectComposer( renderer );





////post processing=================================================






//#region Game Loop
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
    Howler.pos(object.mesh.position.x,0,object.mesh.position.z);      
  }  

  for(const trap of trapsToUpdate)
  {    
    trap.body.position.copy(trap.mesh.getWorldPosition(trapTar));
    trap.body.quaternion.copy(trap.mesh.getWorldQuaternion(tarQuat));                  
  }

  moveChar();

  UpdateCam();  
 
  stats.update(); 
  
  
  //rainVariation();
   

  //controls.update();   
  

  //stats.begin();
  

  renderer.render(scene,camera); 

  //stats.end();  
}

//call it once to kick off the loop
gameLoop();
////main game loop==================================================================
//#endregion Game Loop






////================================================================================
////================================================================================