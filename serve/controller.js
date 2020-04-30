const path = require('path');
// const fse = require('fs-extra');
const fsPromise = require('fs').promises;
const fs = require('fs');
const multiparty = require('multiparty');
const UPLOAD_DIR = path.resolve(__dirname, '..', "target");

function resolvePost(req) {
	return new Promise(resolve => {
		let chunk = '';
		req.on('data',data => {
			chunk += data;
		})
		req.on('end', () => {
			resolve(JSON.parse(chunk))
		})
	})
}


const pipeStream = (path, writeStream) => {
	return new Promise(resolve => {
		const readStream = fs.createReadStream(path);
		readStream.on("end", () => {
			fs.unlinkSync(path);
			resolve();
		});
		readStream.pipe(writeStream);
	})
};
const mergeFileChunk = async (filePath, filename, size) => {
  const chunkDir = path.resolve(UPLOAD_DIR, 'chunkDir', filename);
  const chunkPaths = fs.readdirSync(chunkDir);
	chunkPaths.sort((a, b) => a.split('-')[1] - b.split('-')[1])
	// debugger
	await Promise.all(
		chunkPaths.map((chunkPath,index) => {
			pipeStream(
				path.resolve(chunkDir, chunkPath),
				fs.createWriteStream(filePath, {
					start: index * size,
				})
			)
		})
	)
	if (fs.existsSync(chunkDir)) {
		fs.rmdirSync(chunkDir, {
			recursive: true
		}); // 合并后删除保存切片的目录
	}
}
module.exports = class {
	async handleMerge(req, res) {
		const data = await resolvePost(req);
		const {filename, size} = data;
		const filePath = path.resolve(UPLOAD_DIR, `${filename}`);
		await mergeFileChunk(filePath, filename, size);
		res.end(
			JSON.stringify({
				code: 0,
				msg: 'file merged success'
			})
		)
	}
	async handleFormData(req, res) {
		const multipart = new multiparty.Form();
		multipart.parse(req, async (err, fields, files) => {
			if(err) return;
			const [chunk] = files.chunk;
			const [hash] = fields.hash;
			const [filename] = fields.filename;
			const chunkDir = path.resolve(UPLOAD_DIR, 'chunkDir', filename)
			if (!fs.existsSync(chunkDir)) {
				fs.mkdirSync(chunkDir)
			}

			await fsPromise.rename(chunk.path, `${chunkDir}/${hash}`)
			res.status = 200
			res.end('received file chunk')
		})
	}
}
