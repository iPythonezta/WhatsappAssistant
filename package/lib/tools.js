import fs from 'fs';

const listDir = (path) => {
    const files = [];
    const file_paths = fs.readdirSync(path, { withFileTypes: true });
    file_paths.forEach((file) => {
        if (file.isFile()) {
            const file_path = `${path}/${file.name}`;
            files.push(file_path);
        }
        else if (file.isDirectory()) {
            const sub_files = listDir(`${path}/${file.name}`);
            files.push(...sub_files);
        }
    });
    return files;   
}

const readFile = (path) => {
    const fileContent = fs.readFileSync(path, "utf-8");
    return fileContent;
}

const loadGroupStats = (path) => {
    if (fs.existsSync(path)) {
        const fileContent = readFile(path);
        const json = JSON.parse(fileContent);
        return json;
    }
    else {
        fs.writeFileSync(path, "[]");
        return [];
    }
}

export { listDir, readFile, loadGroupStats };
