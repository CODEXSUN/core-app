import {readFileSync,writeFileSync,mkdirSync,cpSync,rmSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

export function validateContract(contract,version,tag) {
  if(contract.schema!==1||!['apps','devkit'].includes(contract.area)||!/^[a-z][a-z0-9-]*$/.test(contract.name)||contract.owner!==contract.area+'/'+contract.name||!/^CODEXSUN\/[a-z][a-z0-9-]*$/.test(contract.repository))throw new Error('Invalid release owner.');
  if(!/^\d+\.\d+\.\d+$/.test(version)||tag!=='v-'+version)throw new Error('Tag and package version must match.');
  if(!/^node:[a-zA-Z0-9._-]+@sha256:[a-f0-9]{64}$/.test(contract.baseImage))throw new Error('Pin the Node base image digest.');
  const paths=new Set([contract.owner]);
  for(const dep of contract.dependencies??[]) {
    if(!/^(foundation|packages|infrastructure)\/[a-z][a-z0-9-]*$|^mcp-governance$/.test(dep.path)||paths.has(dep.path)||!/^CODEXSUN\/[a-z][a-z0-9-]*$/.test(dep.repository)||!/^[a-f0-9]{40}$/.test(dep.commit)||!/^RELEASE_[A-Z_]+_KEY$/.test(dep.sshSecret))throw new Error('Dependencies require unique safe paths, repositories and immutable commits.');
    paths.add(dep.path);
  }
  return contract;
}
export function migrationHashes(root) {
  // Only Git-tracked app migration files become a release contract.
  const files=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(file=>/(?:^|\/)(?:sqlite-migrations|migrations|tenant-migrations)\/[^/]+\.ts$/.test(file));
  return Object.fromEntries(files.map(file=>[file,createHash('sha256').update(readFileSync(path.join(root,file))).digest('hex')]));
}
export function migrationLineEndings(root) {
 const files=Object.keys(migrationHashes(root));
 return Object.fromEntries(files.map(file=>{const lf=readFileSync(path.join(root,file),'utf8').replaceAll('\r\n','\n');return [file,[lf,lf.replaceAll('\n','\r\n')].map(value=>createHash('sha256').update(value).digest('hex'))];}));
}
async function main() {
  const root=path.resolve(import.meta.dirname,'..'),pkg=JSON.parse(readFileSync(path.join(root,'package.json'),'utf8'));
  const contract=validateContract(JSON.parse(readFileSync(path.join(root,'.container/release.json'),'utf8')),pkg.version,process.env.GITHUB_REF_NAME??'v-'+pkg.version);
  const command=process.argv[2];
  if(command==='check'){console.log('Release contract valid for '+contract.owner+' v-'+pkg.version);return;}
  if(command==='context') {
    const output=path.resolve(process.env.RUNNER_TEMP??path.join(root,'.codeship'),'release-context');
    if(existsSync(output))throw new Error('Release context already exists; use a fresh runner.');
    mkdirSync(output,{recursive:true});
    // Git archive excludes local environment files, runtime databases and ignored credentials.
    const tar=process.platform==='win32'?path.join(process.env.SystemRoot??'C:/Windows','System32/tar.exe'):'tar';
    const archive=execFileSync('git',['archive','HEAD'],{cwd:root,maxBuffer:128*1024*1024});
    const own=path.join(output,contract.owner);mkdirSync(own,{recursive:true});execFileSync(tar,['-xf','-','-C',own],{input:archive});
    const keys=JSON.parse(process.env.RELEASE_SSH_KEYS??'{}');
    const meta=await(await fetch('https://api.github.com/meta')).json();
    const known=path.join(output,'.known_hosts');writeFileSync(known,meta.ssh_keys.map(key=>'github.com '+key).join('\n')+'\n',{mode:0o600});
    for(const dep of contract.dependencies) {
      const key=keys[dep.sshSecret]??process.env[dep.sshSecret];if(!key)throw new Error('Missing read-only dependency key '+dep.sshSecret);
      const keyFile=path.join(output,'.'+dep.sshSecret);writeFileSync(keyFile,key,{mode:0o600});
      try {
        const env={...process.env,GIT_SSH_COMMAND:`ssh -i "${keyFile}" -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile="${known}"`};
        const destination=path.join(output,dep.path);mkdirSync(destination,{recursive:true});
        const git=args=>execFileSync('git',args,{cwd:destination,env,stdio:'pipe'});
        git(['init','--quiet']);git(['remote','add','origin','git@github.com:'+dep.repository+'.git']);git(['fetch','--quiet','--depth=1','origin',dep.commit]);git(['checkout','--quiet','--detach','FETCH_HEAD']);
        if(git(['rev-parse','HEAD']).toString().trim()!==dep.commit)throw new Error('Dependency commit mismatch.');
        rmSync(path.join(destination,'.git'),{recursive:true});
      } finally {rmSync(keyFile,{force:true});}
    }
    rmSync(known);
    // Product Dockerfiles have allowlisted contexts, excluding private/ignored runtime files.
    writeFileSync(process.env.GITHUB_OUTPUT??path.join(root,'.codeship/release-output'),'context='+output+'\n',{flag:'a'});
    return;
  }
  if(command==='manifest') {
    const image=process.env.RELEASE_IMAGE,digest=process.env.RELEASE_DIGEST,commit=process.env.GITHUB_SHA;
    if(image!=='ghcr.io/'+contract.repository.toLowerCase()||!/^sha256:[a-f0-9]{64}$/.test(digest??'')||!/^[a-f0-9]{40}$/.test(commit??''))throw new Error('Invalid published image identity.');
    if(!/^sha256:[a-f0-9]{64}$/.test(process.env.RELEASE_IMAGE_ID??'')||!/^[a-f0-9]{64}$/.test(process.env.RELEASE_ARCHIVE_SHA256??''))throw new Error('Image archive identity missing.');
    writeFileSync(path.join(root,'release-manifest.json'),JSON.stringify({schema:1,owner:contract.owner,repository:contract.repository,version:pkg.version,tag:'v-'+pkg.version,commit,image:image+'@'+digest,imageId:process.env.RELEASE_IMAGE_ID,archive:{name:'image.tar.gz',sha256:process.env.RELEASE_ARCHIVE_SHA256},dependencies:contract.dependencies,baseImage:contract.baseImage,migrations:migrationHashes(root),migrationLineEndings:migrationLineEndings(root)},null,2)+'\n');return;
  }
  throw new Error('Use release.mjs check|context|manifest.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main().catch(()=>{console.error('Release preparation failed; check the contract and dependency access privately.');process.exitCode=1;});
