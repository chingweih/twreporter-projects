import { components } from '../components.config.ts'
import { deployProject } from '../config/deploy.ts'

await deployProject(components, { stylesDirectory: 'src/styles' })
