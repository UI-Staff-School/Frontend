"use client";

import { useUser } from "@/lib/hooks/useUser";
  phoneNumber?: string;
  address?: string;
  gender?: string;
  religion?: string;
          const response = await fetch("/api/staff/me", {
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
                    {getInitials()}
                  </span>
                </div>
              </div>
              </div>
            </div>
          </div>

                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
