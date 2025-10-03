import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  InternalServerErrorException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';

@Injectable()
export class FhirService implements OnModuleInit {
  private readonly logger = new Logger(FhirService.name);

  constructor(private httpService: HttpService) {}

  onModuleInit() {
    const axiosInstance = this.httpService.axiosRef;

    // Request Interceptor
    axiosInstance.interceptors.request.use(
      (config) => {
        this.logger.log(
          `🚀 Gửi Request: ${config.method?.toUpperCase()} ${config.url}`,
        );
        return config;
      },
      (error) => {
        this.logger.error('❌ Lỗi Interceptor Request:', error);
        throw new BadRequestException(
          'Invalid fhir server request configuration',
        );
      },
    );

    // Response Interceptor
    axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        this.logger.log(
          `✅ Nhận Response từ: ${response.config.url} | Status: ${response.status}`,
        );
        return response;
      },
      (error: AxiosError) => {
        console.error('❌ Lỗi Interceptor Response:', error);
        throw new InternalServerErrorException(
          'Invalid fhir server error response',
          error,
        );
      },
    );
  }

  async get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await firstValueFrom(
      this.httpService.get<T>(path, config),
    );
    if (!response || typeof response !== 'object' || !('data' in response)) {
      throw new Error('Invalid response received from GET request');
    }
    return response.data;
  }

  // Phương thức POST chung
  async post<T>(
    path: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await firstValueFrom(
      this.httpService.post<T>(path, data, config),
    );
    return response.data;
  }

  // Phương thức PUT chung
  async put<T>(
    path: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await firstValueFrom(
      this.httpService.put<T>(path, data, config),
    );
    return response.data;
  }

  async patch<T>(
    path: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await firstValueFrom(
      this.httpService.patch<T>(path, data, config),
    );
    return response.data;
  }

  // Phương thức DELETE chung
  async delete<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await firstValueFrom(
      this.httpService.delete<T>(path, config),
    );
    return response.data;
  }
}
