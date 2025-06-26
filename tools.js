import fs from "fs";


const listDir = (path) => {
    const files = [];
    const file_paths = fs.readdirSync(path, { withFileTypes: true });
    file_paths.forEach((file)=>{
        if (file.isFile()){
            const file_path = `${path}/${file.name}`;
            files.push(file_path);
        }
        else if (file.isDirectory()){
            const sub_files = listDir(`${path}/${file.name}`);
            files.push(...sub_files);
        }
    });
    return files;   
}

const main = () => {
    const files_path = "files_to_share"
    const files = listDir(files_path);
    files.forEach((file)=>{
        console.log(`File: ${file}`);
    });
}

main();

export {listDir}