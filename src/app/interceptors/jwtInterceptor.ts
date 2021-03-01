import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { environment } from 'src/environments/environment';

export const InterceptorSkipHeader = 'X-Skip-Interceptor';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add auth header with jwt if user is logged in and request is to the api url
        const currentToken = this.authService.currentUserTokenValue;
        const isLoggedIn =  this.authService.authValue;
        const isApiUrl = request.url.startsWith(environment.apiUrl);

        console.log("INTERCEPTOR: ", currentToken, isLoggedIn, isApiUrl)

        if (request.headers.has(InterceptorSkipHeader)) {
            const headers = request.headers.delete(InterceptorSkipHeader);
            return next.handle(request.clone({ headers }));
        }
        else if (isLoggedIn && isApiUrl) {
            request = request.clone({
                setHeaders: {
                    //ContentType: "application/json",
                    Authorization: `Token ${currentToken}`
                }
            });
        }
        return next.handle(request);
    }
}
