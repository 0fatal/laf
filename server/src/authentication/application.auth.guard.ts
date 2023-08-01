import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common'
import { ApplicationService } from '../application/application.service'
import { IRequest } from '../utils/interface'
import { User } from 'src/user/entities/user'
import { TeamService } from 'src/team/team.service'
import { getRoleLevel } from 'src/team/entities/team-member'
import { Reflector } from '@nestjs/core'

@Injectable()
export class ApplicationAuthGuard implements CanActivate {
  logger = new Logger(ApplicationAuthGuard.name)
  constructor(
    private readonly appService: ApplicationService,
    private readonly teamService: TeamService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest() as IRequest
    const appid = request.params.appid
    const user = request.user as User

    // check appid
    const app = await this.appService.findOne(appid)
    if (!app) {
      return false
    }

    const isOwner = app.createdBy.equals(user._id)

    // check team
    const teams = await this.teamService.findTeamsByAppidAndUid(appid, user._id)
    if (teams.length === 0) {
      // inject app to request
      request.application = app
      return isOwner
    }
    const team = teams[0]

    // check role
    const roles = this.reflector.get<string[]>(
      'team-roles',
      context.getHandler(),
    )
    if (roles?.length > 0) {
      const roleLevels = roles.map(getRoleLevel).sort((a, b) => a - b)
      teams.sort((a, b) => getRoleLevel(b.role) - getRoleLevel(a.role))

      if (roleLevels[0] > getRoleLevel(team.role)) {
        return false
      }
    }

    // inject app to request
    request.application = app
    // inject team to request
    request.team = team

    return true
  }
}
