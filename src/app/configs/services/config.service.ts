import ConfigServiceInterface from "../models/interfaces/config.service.interface.js"

class ConfigService implements ConfigServiceInterface {

    getPathProject = ():string => {
        return process.cwd()
    }
}

export default ConfigService