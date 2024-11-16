
import * as ExifReader from 'exifreader';
import ExifParser from 'exif-parser';
import mediafileMetadata from "mediafile-metadata";

export default class PictureReader {
    /**
     * Tags of the Picture
     * @param {Buffer} data 
     * @returns {ExifReader.Tags}
     */
    async getTags(data) {
        const tags = await ExifReader.default.load(data, {async: true});
        return tags;
    }

    /**
     * Tags of the Picture
     * @param {Buffer} data 
     * @param {String} fileEnding
     * @returns {String}
     */
    async createFileNameFromDate(data, fileEnding) {
        let fileName = "";
        const tags = await this.getTags(data);
        if (tags && tags.DateTimeOriginal ) {
            const creationDate = tags.DateTimeOriginal.description;
            //'2022:12:31 15:44:11'
            fileName = creationDate.replaceAll(":", "");
            fileName = fileName.replace(" ", "_");
        } else {
            const parser = ExifParser.create(data);
            const result = parser.parse();
            if (result.tags && result.tags.DateTimeOriginal ) {
                const creationDate = result.tags.DateTimeOriginal;
                const newFileName = this.stringFromDate(creationDate);
                fileName = newFileName;
            }
        }
        if (fileName) {
            fileName = `${fileName}.${fileEnding}`; 
        }
        return fileName;
    }

    stringFromDate(date) {
        const newDate = new Date(date * 1000).toISOString()
        //'2022-12-16T15:32:54.000Z'
        let timestamp = newDate.replace("-", "");
        timestamp = timestamp.replace("-", "");
        timestamp = timestamp.replace(":", "");
        timestamp = timestamp.replace(":", "");
        timestamp = timestamp.replace(".000Z", "");
        timestamp = timestamp.replace("T", "_");
        return timestamp;
    }

    stringFromDate2(date) {
        const newDate = date.toISOString()
        //'2022-12-16T15:32:54.000Z'
        let timestamp = newDate.replace("-", "");
        timestamp = timestamp.replace("-", "");
        timestamp = timestamp.replace(":", "");
        timestamp = timestamp.replace(":", "");
        timestamp = timestamp.replace(".000Z", "");
        timestamp = timestamp.replace("T", "_");
        return timestamp;
    }

    /**
     * 
     * @param {String} filePath 
     * @returns {mediafileMetadata.Essentials}
     */
    async getVideoEssentials(filePath) {
        return await mediafileMetadata.getEssentials(filePath); // path to photo or video file
    }
}